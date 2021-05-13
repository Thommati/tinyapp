const { assert } = require('chai');
const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers');

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

const urlDatabase = {
  b2xVn2: { longURL: 'https://www.tsn.ca', userId: 'b2xVn3' },
  '9sm5xK': { longURL: 'https://www.bing.com', userId: 'b2xVn3' }
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

describe('generateRandomString', () => {
  it('should return a string of six characters', () => {
    const actualLength = generateRandomString().length;
    assert.equal(actualLength, 6);
  });
  
  it('should return two different strings when called twice', () => {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notEqual(string1, string2);
  });
  
  describe('urlsForUser', () => {
    it('should return an empty object if the user does not have any urls saved in database', () => {
      const actual = urlsForUser('abcdef', urlDatabase);
      assert.deepEqual(actual, {});
    });
    
    it('returns the user\'s owned urls as an object of url objects', () => {
      const actual = urlsForUser('b2xVn3', urlDatabase);
      const expected = {
        b2xVn2: { longURL: 'https://www.tsn.ca', userId: 'b2xVn3' },
        '9sm5xK': { longURL: 'https://www.bing.com', userId: 'b2xVn3' }
      };
      assert.deepEqual(actual, expected);
    });
  });
});
