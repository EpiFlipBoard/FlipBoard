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
      username: 'testauthor',
      email: 'author@example.com',
      password: 'hashedpassword123',
    });
  });

  test('should create a valid post', async () => {
    const postData = {
      title: 'Test Article',
      description: 'A test description',
      content: 'This is test content',
      author: testUser._id,
      source: 'Test Source',
      tags: ['test', 'article'],
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    expect(savedPost._id).toBeDefined();
    expect(savedPost.title).toBe(postData.title);
    expect(savedPost.author.toString()).toBe(testUser._id.toString());
    expect(savedPost.tags).toEqual(postData.tags);
  });

  test('should fail without required fields', async () => {
    const post = new Post({
      title: 'Incomplete Post',
    });

    let error;
    try {
      await post.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  test('should have default values', async () => {
    const post = await Post.create({
      title: 'Test Post',
      description: 'Description',
      content: 'Content',
      author: testUser._id,
      source: 'Source',
    });

    expect(post.likes).toEqual([]);
    expect(post.views).toBe(0);
    expect(post.isPublished).toBe(true);
  });
});
