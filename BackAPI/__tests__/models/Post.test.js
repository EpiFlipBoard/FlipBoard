import mongoose from 'mongoose';
import Post from '../../src/models/Post.js';
import User from '../../src/models/User.js';

const skipIfNoMongoDB = process.env.CI ? describe.skip : describe;

skipIfNoMongoDB('Post Model', () => {
  let testUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    testUser = await User.create({
      email: 'author@example.com',
      passwordHash: 'hashedpassword123',
      name: 'Test Author',
    });
  });

  test('should create a valid post', async () => {
    const postData = {
      title: 'Test Article',
      description: 'A test description',
      content: 'This is test content',
      author: 'Test Author Name',
      authorId: testUser._id,
      type: 'Article',
      url: 'https://example.com/article',
      imageUrl: 'https://example.com/image.jpg',
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    expect(savedPost._id).toBeDefined();
    expect(savedPost.title).toBe(postData.title);
    expect(savedPost.author).toBe(postData.author);
    expect(savedPost.authorId.toString()).toBe(testUser._id.toString());
    expect(savedPost.likes).toBe(0);
  });

  test('should fail without required fields', async () => {
    const post = new Post({
      description: 'Missing title',
    });

    let error;
    try {
      await post.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.title).toBeDefined();
  });

  test('should have default values', async () => {
    const post = await Post.create({
      title: 'Test Post',
    });

    expect(post.likes).toBe(0);
    expect(post.likedBy).toEqual([]);
    expect(post.type).toBe('Magazine');
    expect(post.author).toBe('Epi-Flipboard team');
  });
});
