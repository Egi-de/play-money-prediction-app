const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin() {
  try {
    // Connect to production DB
    await mongoose.connect('mongodb+srv://predictx-admin:alma2025@cluster0.yaq2j1x.mongodb.net/PredictX');
    console.log('✅ Connected to Production MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (admin) {
      console.log('\n📊 Admin User Found:');
      console.log('   ID:', admin._id);
      console.log('   Username:', admin.username);
      console.log('   Points:', admin.points);
      console.log('   isAdmin:', admin.isAdmin);
      console.log('   Created:', admin.createdAt);
    } else {
      console.log('❌ Admin user NOT found in database');
    }

    // List all users to verify
    const allUsers = await User.find({});
    console.log(`\n📋 Total users in DB: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`   - ${u.username} (isAdmin: ${u.isAdmin}, points: ${u.points})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();
