const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('User Model', () => {
  it('crée un utilisateur simple', () => {
    const user = new User({ email: 'test@example.com', password: '123456' });
    expect(user.email).toBe('test@example.com');
  });
});
