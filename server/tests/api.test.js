const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("../routes/api");
const User = require("../models/User");

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Test database connection
beforeAll(async () => {
  const testDbUri = "mongodb://localhost:27017/prediction-market-test";
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Prediction Market API Tests", () => {
  let testUserId;
  let testMarketId;
  let adminUserId;

  // Create admin user before running tests
  beforeAll(async () => {
    const adminUser = new User({
      username: "admin",
      points: 10000,
      isAdmin: true,
    });
    await adminUser.save();
    adminUserId = adminUser._id;
  });

  describe("POST /api/users", () => {
    it("should create a new user with 1000 starting points", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ username: "testuser" });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("testuser");
      expect(res.body.points).toBe(1000);
      expect(res.body._id).toBeDefined();

      testUserId = res.body._id;
    });

    it("should return existing user if username already exists", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ username: "testuser" });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("testuser");
      expect(res.body._id).toBe(testUserId);
    });
  });

  describe("POST /api/markets", () => {
    it("should create a new market", async () => {
      const res = await request(app)
        .post("/api/markets")
        .send({
          question: "Will it rain tomorrow?",
          description: "Test market",
          outcomes: ["Yes", "No"],
          closesAt: new Date(Date.now() + 86400000), // Tomorrow
          userId: adminUserId, // Admin authentication
        });

      expect(res.status).toBe(200);
      expect(res.body.question).toBe("Will it rain tomorrow?");
      expect(res.body.outcomes).toEqual(["Yes", "No"]);
      expect(res.body.status).toBe("OPEN");

      testMarketId = res.body._id;
    });
  });

  describe("GET /api/markets", () => {
    it("should return list of markets", async () => {
      const res = await request(app).get("/api/markets");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/orders", () => {
    it("should place a valid prediction", async () => {
      const res = await request(app).post("/api/orders").send({
        userId: testUserId,
        marketId: testMarketId,
        outcome: "Yes",
        amount: 100,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Prediction placed");
      expect(res.body.user.points).toBe(900); // 1000 - 100
    });

    it("should reject prediction with insufficient balance", async () => {
      const res = await request(app).post("/api/orders").send({
        userId: testUserId,
        marketId: testMarketId,
        outcome: "Yes",
        amount: 2000, // More than available
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Insufficient balance");
    });

    it("should reject prediction with negative amount", async () => {
      const res = await request(app).post("/api/orders").send({
        userId: testUserId,
        marketId: testMarketId,
        outcome: "Yes",
        amount: -50,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Amount must be positive");
    });
  });

  describe("GET /api/leaderboard", () => {
    it("should return top users sorted by points", async () => {
      const res = await request(app).get("/api/leaderboard");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Check if sorted by points descending
      for (let i = 0; i < res.body.length - 1; i++) {
        expect(res.body[i].points).toBeGreaterThanOrEqual(
          res.body[i + 1].points
        );
      }
    });
  });

  describe("POST /api/markets/:id/resolve", () => {
    it("should resolve a market and distribute payouts", async () => {
      const res = await request(app)
        .post(`/api/markets/${testMarketId}/resolve`)
        .send({
          outcome: "Yes",
          userId: adminUserId, // Admin authentication
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Market resolved");
      expect(res.body.market.status).toBe("RESOLVED");
      expect(res.body.market.resolvedOutcome).toBe("Yes");
    });

    it("should not allow resolving an already resolved market", async () => {
      const res = await request(app)
        .post(`/api/markets/${testMarketId}/resolve`)
        .send({
          outcome: "No",
          userId: adminUserId, // Admin authentication
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Market already resolved");
    });
  });
});
