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

const urlsForUser = (id, urlDB) => {
  const usersUrls = {};
  for (const shortURL of Object.keys(urlDB)) {
    if (urlDB[shortURL].userId === id) {
      usersUrls[shortURL] = urlDB[shortURL];
    }
  }
  return usersUrls;
};

const totalNumberOfVisits = ({numVisits}) => {
  let totalVisits = 0;
  for (const ip of Object.keys(numVisits)) {
    totalVisits += numVisits[ip];
  }
  return totalVisits;
};

const totalUniqueIPVisits = ({numVisits}) => {
  return Object.keys(numVisits).length;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  totalNumberOfVisits,
  totalUniqueIPVisits
};
