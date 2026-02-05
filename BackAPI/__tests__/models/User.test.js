import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  test('should create a valid user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.createdAt).toBeDefined();
  });

  test('should fail without required fields', async () => {
    const user = new User({});
    
    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  test('should fail with duplicate email', async () => {
    const userData = {
      username: 'testuser1',
      email: 'duplicate@example.com',
      password: 'hashedpassword123',
    };

    await User.create(userData);

    const duplicateUser = new User({
      username: 'testuser2',
      email: 'duplicate@example.com',
      password: 'hashedpassword456',
    });

    let error;
    try {
      await duplicateUser.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });
});
