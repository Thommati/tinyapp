const urlDatabase = {
  b2xVn2: {
    longURL: 'https://www.tsn.ca',
    userId: 'b2xVn3',
    createdAt: new Date('May 13, 2021 13:24:20'),
    numVisits: {
      '127.0.0.1': 2,
      '142.143.64.50': 43
    }
  },
  '9sm5xK': {
    longURL: 'https://www.bing.com',
    userId: 'b2xVn3',
    createdAt: new Date('May 7, 2021 13:11:00'),
    numVisits: {
      '127.0.0.1': 7
    }
  }
};

const users = {
  'b2xVn3': {
    id: 'b2xVn3',
    email: 'user@example.com',
    password: '$2b$12$zzXLYApUz0mNvnrJoSQKtuRqutVjJjkBfctSisqU2hw8uDfHeRMeC'
  },
  'b2xAb7': {
    id: 'b2xAb7',
    email: 'user2@example.com',
    password: '$2b$12$zzXLYApUz0mNvnrJoSQKtuRqutVjJjkBfctSisqU2hw8uDfHeRMeC'
  }
};

module.exports = { urlDatabase, users };
