const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Market = require('../models/Market');
const Order = require('../models/Order');

// --- USERS ---

// Create or Login User
router.post('/users', async (req, res) => {
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
router.get('/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get orders
    const orders = await Order.find({ userId: user._id }).sort({ timestamp: -1 }).populate('marketId');
    res.json({ user, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MARKETS ---

// List Markets
router.get('/markets', async (req, res) => {
  try {
    const markets = await Market.find().sort({ createdAt: -1 });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Market Detail
router.get('/markets/:id', async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Market (Seed/Admin)
router.post('/markets', async (req, res) => {
  try {
    const { question, description, outcomes, closesAt } = req.body;
    
    // Initialize pools
    const outcomePools = {};
    const initialSeed = 0; // Or we can seed with 0
    outcomes.forEach(o => outcomePools[o] = initialSeed);

    const market = new Market({
      question,
      description,
      outcomes,
      outcomePools,
      closesAt
    });
    await market.save();
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER / PREDICT ---
router.post('/orders', async (req, res) => {
  try {
    const { userId, marketId, outcome, amount } = req.body;

    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    // 1. Atomic Balance Check & Deduct
    const user = await User.findOneAndUpdate(
        { _id: userId, points: { $gte: amount } },
        { $inc: { points: -amount } },
        { new: true }
    );

    if (!user) {
        return res.status(400).json({ error: 'Insufficient balance or User not found' });
    }

    // 2. Verify Market Open (Double check)
    // Note: Technically still a tiny race window on status if it closes *right now*, 
    // but less critical than double-spending logic.
    const market = await Market.findById(marketId);
    if (!market || market.status !== 'OPEN' || new Date() > new Date(market.closesAt)) {
        // Refund if market closed in verify step
        await User.findByIdAndUpdate(userId, { $inc: { points: amount } });
        return res.status(400).json({ error: 'Market is closed or invalid' });
    }

    // 3. Atomic Pool Update
    // dynamic key for map update in dot notation: "outcomePools.Yes"
    const poolUpdate = {};
    poolUpdate[`outcomePools.${outcome}`] = amount;
    
    // We use findOneAndUpdate to ensure atomic increment of the specific map field
    const updatedMarket = await Market.findByIdAndUpdate(
        marketId,
        { $inc: poolUpdate },
        { new: true }
    );

    // 4. Create Order
    const order = new Order({
      userId,
      marketId,
      outcome,
      amount
    });
    await order.save();

    res.json({ message: 'Prediction placed', user, market: updatedMarket, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESOLVE ---
router.post('/markets/:id/resolve', async (req, res) => {
  try {
    const { outcome } = req.body;
    const market = await Market.findById(req.params.id);
    
    if (!market) return res.status(404).json({ error: 'Market not found' });
    if (market.status !== 'OPEN') return res.status(400).json({ error: 'Market already resolved' });
    if (!market.outcomes.includes(outcome)) return res.status(400).json({ error: 'Invalid outcome' });

    market.status = 'RESOLVED';
    market.resolvedOutcome = outcome;
    
    // Calculate Payouts
    // 1. Total Pool
    let totalPool = 0;
    for (let amount of market.outcomePools.values()) {
        totalPool += amount;
    }
    
    // 2. Winning Pool
    const winningPool = market.outcomePools.get(outcome) || 0;

    // 3. Find Winners
    const winningOrders = await Order.find({ marketId: market._id, outcome: outcome });

    if (winningPool > 0) {
        for (const order of winningOrders) {
            // Share = (Order Amount / Winning Pool)
            // Payout = Share * Total Pool
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
    } else {
        // Edge case: No winners? House keeps it.
    }

    await market.save();
    res.json({ message: 'Market resolved', market });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
