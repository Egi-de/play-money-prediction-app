require('dotenv').config();
const mongoose = require('mongoose');
const Market = require('./models/Market');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prediction-market')
  .then(() => console.log('Connected for seeding'))
  .catch(err => console.error(err));

const markets = [
  {
    question: "Will Bitcoin hit $100k by the end of 2026?",
    description: "Predicting if BTC price will touch $100,000 USD on any major exchange before Jan 1, 2027.",
    outcomes: ["Yes", "No"],
    outcomePools: { "Yes": 500, "No": 500 },
    closesAt: new Date("2026-12-31"),
  },
  {
    question: "Will SpaceX land humans on Mars before 2030?",
    description: "Successful landing of at least one human on the surface of Mars.",
    outcomes: ["Yes", "No"],
    outcomePools: { "Yes": 200, "No": 800 },
    closesAt: new Date("2029-12-31"),
  },
  {
    question: "Will GPT-6 be released in 2026?",
    description: "Official public release or announcement of GPT-6 by OpenAI.",
    outcomes: ["Yes", "No"],
    outcomePools: { "Yes": 1000, "No": 200 },
    closesAt: new Date("2026-12-31"),
  }
];

const seed = async () => {
  await Market.deleteMany({});
  await Market.insertMany(markets);
  console.log('Markets seeded!');
  process.exit();
};

seed();
