const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * Bootstrap script to create super admin user
 * Run with: node seed.js
 */
async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prediction-market');
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPoints = parseInt(process.env.ADMIN_POINTS) || 10000;

    // Check if admin already exists
    let admin = await User.findOne({ username: adminUsername });

    if (admin) {
      // Update existing user to be admin
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
        console.log(`✅ Updated existing user "${adminUsername}" to admin`);
      } else {
        console.log(`ℹ️  Admin user "${adminUsername}" already exists`);
      }
    } else {
      // Create new admin user
      admin = new User({
        username: adminUsername,
        points: adminPoints,
        isAdmin: true
      });
      await admin.save();
      console.log(`✅ Created super admin: "${adminUsername}" with ${adminPoints} points`);
    }

    console.log('\n🎉 Super admin setup complete!');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Admin: ${admin.isAdmin}`);
    console.log(`   Points: ${admin.points}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
