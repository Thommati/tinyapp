const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expected = testUsers.userRandomID;
    assert.deepEqual(user, expected);
  });
  
  it('should return undefined if the email does not exist', () => {
    const actual = getUserByEmail('dog@example.com', testUsers);
    assert.isUndefined(actual);
  });
  
  it('should return undefined if an empty string passed in for an email', () => {
    const actual = getUserByEmail('', testUsers);
    assert.isUndefined(actual);
  });
  
  it('should return undefined if an empty database is passed in', () => {
    const actual = getUserByEmail('user@example.com', {});
    assert.isUndefined(actual);
  });
});
