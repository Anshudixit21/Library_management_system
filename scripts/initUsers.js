const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

async function initUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: library_management`);
    console.log(`🔗 Connection URI: ${MONGODB_URI}`);

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@library.com'
      });
      await admin.save();
      console.log('Admin user created: username=admin, password=admin123');
    } else {
      console.log('Admin user already exists');
    }

    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      const user = new User({
        username: 'user',
        password: 'user123',
        role: 'user',
        name: 'Test User',
        email: 'user@library.com'
      });
      await user.save();
      console.log('User created: username=user, password=user123');
    } else {
      console.log('User already exists');
    }

    console.log('✅ Initialization complete!');
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing users:', error.message);
    console.error('Full error:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

initUsers();

