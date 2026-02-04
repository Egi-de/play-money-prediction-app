const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Market = require("../models/Market");
const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");
const { requireAdmin } = require("../middleware/auth");

// --- USERS ---

// Create or Login User
router.post("/users", async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile (Balance + History)
router.get("/users/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get orders
    const orders = await Order.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .populate("marketId");
    res.json({ user, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .sort({ points: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ---

// Check Admin Status
router.get("/admin/check", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json({ isAdmin: false });

    const user = await User.findById(userId);
    res.json({ isAdmin: user ? user.isAdmin : false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Audit Logs (Protected)
router.get("/admin/logs", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    console.log("[Admin Logs] Fetching logs with limit:", limit);

    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
    console.log("[Admin Logs] Found", logs.length, "logs");

    res.json(logs);
  } catch (err) {
    console.error("[Admin Logs] Error fetching logs:", err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

// --- MARKETS ---

// List Markets
router.get("/markets", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    // If category is specified and not 'All', filter by category
    if (category && category !== "All") {
      filter.category = category;
    }

    const markets = await Market.find(filter).sort({ createdAt: -1 });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Market Detail
router.get("/markets/:id", async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: "Market not found" });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Market (Protected)
router.post("/markets", requireAdmin, async (req, res) => {
  try {
    const { question, description, outcomes, closesAt, category } = req.body;

    // Validate closesAt date
    if (new Date(closesAt) <= new Date()) {
      return res
        .status(400)
        .json({ error: "Closing date must be in the future" });
    }

    // Initialize pools
    const outcomePools = {};
    const initialSeed = 0;
    outcomes.forEach((o) => (outcomePools[o] = initialSeed));

    const market = new Market({
      question,
      description,
      category: category || "All",
      outcomes,
      outcomePools,
      closesAt,
    });
    await market.save();

    // Audit Log
    await new AuditLog({
      userId: req.adminUser._id,
      username: req.adminUser.username,
      action: "CREATE_MARKET",
      targetId: market._id,
      details: { question, category },
    }).save();

    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Market (Protected)
router.delete("/markets/:id", requireAdmin, async (req, res) => {
  try {
    const market = await Market.findByIdAndDelete(req.params.id);
    if (!market) return res.status(404).json({ error: "Market not found" });

    // Audit Log
    await new AuditLog({
      userId: req.adminUser._id,
      username: req.adminUser.username,
      action: "DELETE_MARKET",
      targetId: market._id,
      details: { question: market.question },
    }).save();

    res.json({ message: "Market deleted", marketId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER / PREDICT ---
router.post("/orders", async (req, res) => {
  try {
    const { userId, marketId, outcome, amount } = req.body;

    if (amount <= 0)
      return res.status(400).json({ error: "Amount must be positive" });

    // 0. Prevent admin users from betting
    const bettingUser = await User.findById(userId);
    if (!bettingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (bettingUser.isAdmin) {
      return res.status(403).json({ error: "Admin users cannot place bets" });
    }

    // 1. Atomic Balance Check & Deduct
    const user = await User.findOneAndUpdate(
      { _id: userId, points: { $gte: amount } },
      { $inc: { points: -amount } },
      { new: true },
    );

    if (!user) {
      return res
        .status(400)
        .json({ error: "Insufficient balance or User not found" });
    }

    // 2. Verify Market Open
    const market = await Market.findById(marketId);
    if (
      !market ||
      market.status !== "OPEN" ||
      new Date() > new Date(market.closesAt)
    ) {
      // Refund if market closed
      await User.findByIdAndUpdate(userId, { $inc: { points: amount } });
      return res.status(400).json({ error: "Market is closed or invalid" });
    }

    // 3. Atomic Pool Update
    const poolUpdate = {};
    poolUpdate[`outcomePools.${outcome}`] = amount;

    // We use findOneAndUpdate to ensure atomic increment
    const updatedMarket = await Market.findByIdAndUpdate(
      marketId,
      { $inc: poolUpdate },
      { new: true },
    );

    // 4. Create Order
    const order = new Order({
      userId,
      marketId,
      outcome,
      amount,
    });
    await order.save();

    res.json({
      message: "Prediction placed",
      user,
      market: updatedMarket,
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESOLVE (Protected) ---
router.post("/markets/:id/resolve", requireAdmin, async (req, res) => {
  try {
    const { outcome } = req.body;
    const market = await Market.findById(req.params.id);

    if (!market) return res.status(404).json({ error: "Market not found" });
    if (market.status !== "OPEN")
      return res.status(400).json({ error: "Market already resolved" });
    if (!market.outcomes.includes(outcome))
      return res.status(400).json({ error: "Invalid outcome" });

    market.status = "RESOLVED";
    market.resolvedOutcome = outcome;

    // Calculate Payouts
    let totalPool = 0;
    for (let amount of market.outcomePools.values()) {
      totalPool += amount;
    }

    const winningPool = market.outcomePools.get(outcome) || 0;
    const winningOrders = await Order.find({
      marketId: market._id,
      outcome: outcome,
    });

    if (winningPool > 0) {
      for (const order of winningOrders) {
        const share = order.amount / winningPool;
        const payout = Math.floor(share * totalPool);

        // Refund/Payout to user
        const user = await User.findById(order.userId);
        if (user) {
          user.points += payout;
          await user.save();
        }

        // Update Order record
        order.payout = payout;
        await order.save();
      }
    }

    await market.save();

    // Audit Log
    await new AuditLog({
      userId: req.adminUser._id,
      username: req.adminUser.username,
      action: "RESOLVE_MARKET",
      targetId: market._id,
      details: { outcome, totalPool },
    }).save();

    res.json({ message: "Market resolved", market });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
