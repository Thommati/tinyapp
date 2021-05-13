const getUserByEmail = (email, database) => {
  for (const id of Object.keys(database)) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

module.exports = { getUserByEmail };
