const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: library_management\n`);

    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n💡 Run the following command to create default users:');
      console.log('   npm run init-users\n');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}\n`);
      });
    }

    const admin = await User.findOne({ username: 'admin' });
    const regularUser = await User.findOne({ username: 'user' });

    console.log('--- Default User Check ---');
    if (admin) {
      console.log('✅ Admin user exists');
    } else {
      console.log('❌ Admin user NOT found');
    }

    if (regularUser) {
      console.log('✅ Regular user exists');
    } else {
      console.log('❌ Regular user NOT found');
    }

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running!');
      console.error('   Please start MongoDB service and try again.');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed!');
      console.error('   Check your MongoDB credentials.');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkUsers();

