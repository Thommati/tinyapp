const express = require('express');
const { urlDatabase } = require('../data');
const {
  generateRandomString,
  urlsForUser,
  totalNumberOfVisits,
  totalUniqueIPVisits
} = require('../helpers');

const router = express.Router();

//  Redirect based on logged in status
router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
});

// GET all of a user's URLs
router.get('/urls', (req, res) => {
  const user = req.user;
  const templateVars = { urls: null, errorMessage: '' };
  if (!user) {
    templateVars.errorMessage = 'You must be logged in to view this page';
    return res.status(401).render('urls_index', templateVars);
  }
  templateVars.urls = urlsForUser(user.id, urlDatabase);
  return res.render('urls_index', templateVars);
});

// Create new URL
router.post('/urls', (req, res) => {
  const user = req.user;
  // Return Unauthorized if valid user not logged in.
  if (!user) {
    const templateVars = {
      errorMessage: 'You must be logged in to create new short URLs.'
    };
    return res.status(401).render('urls_index', templateVars);
  }
  
  // Create shortURL entry and add it to the database.
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    userId: user.id,
    longURL: req.body.longURL,
    createdAt: new Date(),
    numVisits: { }
  };
  
  return res.redirect(`/urls/${shortUrl}`);
});

// GET create new URL form
router.get('/urls/new', (req, res) => {
  const user = req.user;
  
  // Redirect to /login if user not logged in.
  if (!user) {
    return res.redirect('/login');
  }
  
  // Return create new URL form.
  return res.render('urls_new');
});

// POST to delete a url
router.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const user = req.user;
  const templateVars = {
    statusMessage: '',
    errorMessage: ''
  };
  
  // If not logged in return unauthorized
  if (!user) {
    templateVars.statusMessage = '401 Not Authorized';
    templateVars.errorMessage = 'You must be logged in to be able to delete short URLs';
    return res.status(401).render('status_page', templateVars);
  }
  
  // Return not found if database entry cannot be found for shortURL.
  if (!urlDatabase[shortURL]) {
    templateVars.statusMessage = '404 Page Not Found';
    templateVars.errorMessage = `The short URL, "${shortURL}" could not be found.`;
    return res.status(404).render('status_page', templateVars);
  }
  
  // Return forbidden if user is not owner of the shortURL.
  if (urlDatabase[shortURL].userId !== user.id) {
    templateVars.statusMessage = '403 Forbidden';
    templateVars.errorMessage = 'You must be the owner of short URL in order to delete it.';
    return res.status(403).render('status_page', templateVars);
  }
  
  // Delete shortURL from DB and redirect to /urls
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

// GET individual shortURL. User can only see thir own.
router.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const user = req.user;
  let url = null;
  const templateVars = { url, shortURL, errorMessage: '', statusMessage: '' };

  // Return 401 Unauthorized if user is not logged in.
  if (!user) {
    templateVars.errorMessage = 'You must be logged in to view this page';
    return res.status(401).render('urls_index', templateVars);
  }
  
  // Return 404 Page Not Found if DB entry for shortURL does not exist.
  if (!urlDatabase[shortURL]) {
    templateVars.statusMessage = '404 Page Not Found';
    templateVars.errorMessage = `Short URL, "${shortURL}" could not be found.`;
    return res.status(404).render('status_page', templateVars);
  }

  // Return 403 Forbidden if user is not the owner of the shortURL.
  if (user.id !== urlDatabase[shortURL].userId) {
    templateVars.statusMessage = '403 Forbidden';
    templateVars.errorMessage = 'You must be the owner of short URL in order to view it.';
    return res.status(403).render('status_page', templateVars);
  }

  url = urlDatabase[shortURL];
  
  // Count total and uniqueVisits and add to url objects for display.
  url.totalVisits = totalNumberOfVisits(url);
  url.uniqueVisits = totalUniqueIPVisits(url);
  templateVars.url = url;
  return res.render('urls_show', templateVars);
});

// Edit a urlDatabase entry
router.post('/urls/:shortURL', (req, res) => {
  const user = req.user;
  const templateVars = { statusMessage: '', errorMessage: '' };
  
  // Return 401 Unauthorized if user is not logged in.
  if (!user) {
    templateVars.statusMessage = '401 Unauthorized';
    templateVars.errorMessage = 'You must be logged in to edit a short URL';
    return res.status(401).render('status_page', templateVars);
  }
  
  const { shortURL } = req.params;
  const entry = urlDatabase[shortURL];
  
  // Return 404 Not Found if database entry for the shortURL is not found.
  if (!entry) {
    templateVars.statusMessage = '404 Not Found';
    templateVars.errorMessage = `Entry "${shortURL}" could not be found`;
    return res.satus(404).render('status_page', templateVars);
  }
  
  // Return 403 Forbidden if logged in user is not the owner of the shortURL.
  if (entry.userId !== user.id) {
    templateVars.statusMessage = '403 Forbidden';
    templateVars.errorMessage = 'You must be the owner of short URL in order to edit it.';
    return res.status(403).render('status_page/403', templateVars);
  }
  
  // Update the database entry and redirect to /urls.
  entry.longURL = req.body.longURL;
  return res.redirect('/urls');
});

// Redirect to external sites route.
router.get('/u/:shortURL', (req, res) => {
  // If a valid address is entered redirect to the appropriate external site.
  const longObj = urlDatabase[req.params.shortURL];
  if (longObj) {
    longObj.numVisits[req.ip] ? longObj.numVisits[req.ip]++ : longObj.numVisits[req.ip] = 1;
    return res.redirect(longObj.longURL);
  }
  
  // Return 404 Not Found if url is invalid.
  return res.status(404).render('statusPages/404');
});

module.exports = router;
