import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://shibinkumarkmd_db_user:A2D2g8ZlOWPyqGCk@cluster0.stpswgf.mongodb.net/?appName=Cluster0";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testLogin() {
  await mongoose.connect(MONGODB_URI);
  const email = 'admin@spicewizz.com';
  const password = 'spicewizz123';
  
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', user ? user.email : 'No');
  
  if (user) {
    console.log('Role:', user.role);
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isPasswordMatch);
  }
  
  await mongoose.disconnect();
}

testLogin();
