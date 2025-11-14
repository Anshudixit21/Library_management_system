const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

async function viewUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: library_management`);
    console.log(`📁 Collection: users\n`);
    console.log('='.repeat(60));

    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
    } else {
      console.log(`\n✅ Found ${users.length} user(s) in database:\n`);
      console.log('='.repeat(60));
      
      users.forEach((user, index) => {
        console.log(`\n👤 User #${index + 1}:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('-'.repeat(60));
      });
    }

    console.log('\n📋 Database Information:');
    console.log(`   Database Name: library_management`);
    console.log(`   Collection Name: users`);
    console.log(`   Connection URI: ${MONGODB_URI}`);
    console.log(`   Total Users: ${users.length}`);

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing users:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running!');
      console.error('   Please start MongoDB service and try again.');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

viewUsers();

