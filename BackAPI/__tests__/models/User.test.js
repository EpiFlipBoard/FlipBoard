import mongoose from 'mongoose';
import User from '../../src/models/User.js';

const skipIfNoMongoDB = process.env.CI ? describe.skip : describe;

skipIfNoMongoDB('User Model', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    // Ensure indexes are created
    await User.init();
  });

  test('should create a valid user', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword123',
      name: 'Test User',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.passwordHash).toBe(userData.passwordHash);
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
      email: 'duplicate@example.com',
      passwordHash: 'hashedpassword123',
      name: 'User 1',
    };

    await User.create(userData);

    const duplicateUser = new User({
      email: 'duplicate@example.com',
      passwordHash: 'hashedpassword456',
      name: 'User 2',
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
