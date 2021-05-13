const getUserByEmail = (email, database) => {
  let user = null;
  for (const id of Object.keys(database)) {
    if (database[id].email === email) {
      user = database[id];
      break;
    }
  }
  return user;
};

module.exports = { getUserByEmail };