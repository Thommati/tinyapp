const getUserByEmail = (email, database) => {
  for (const id of Object.keys(database)) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = { getUserByEmail, generateRandomString };
