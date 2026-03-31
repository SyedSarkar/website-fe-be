import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@parenting.com';
    const password = 'admin123';

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('🔑 Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
    console.log('🔐 Role:', user.role);

    // Test password comparison
    const isMatch = await user.comparePassword(password);
    console.log('🔓 Password match:', isMatch);

    await mongoose.disconnect();
    process.exit(isMatch ? 0 : 1);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
