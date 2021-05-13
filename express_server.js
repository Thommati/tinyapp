const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./data');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'TinySession',
  secret: 'tinyURLsessionSecret'
}));

//  Redirect based on logged in status
app.get('/', (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
});

// GET all of a user's URLs
app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const usersUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { user, urls: usersUrls };
  return res.render('urls_index', templateVars);
});

// Create new URL
app.post('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  
  // Return Unauthorized if valid user not logged in.
  if (!user) {
    return res.status(401).render('statusPages/401', { user });
  }
  
  // Create shortURL entry and add it to the database.
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    userId,
    longURL: req.body.longURL
  };
  
  return res.redirect(`/urls/${shortUrl}`);
});

// GET create new URL form
app.get('/urls/new', (req, res) => {
  const user = users[req.session['user_id']];
  
  // Redirect to /login if user not logged in.
  if (!user) {
    return res.redirect('/login');
  }
  
  // Return create new URL form.
  const templateVars = { user };
  return res.render('urls_new', templateVars);
});

// POST to delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = { user: null };
  
  // If not logged in return unauthorized
  if (!userId) {
    return res.status(401).render('statusPages/401', templateVars);
  }
  
  // Get user object for userId and assign it to template vars.
  const user = users[userId];
  templateVars.user = user;
  const { shortURL } = req.params;
  
  // Return not found if database entry cannot be found for shortURL
  if (!urlDatabase[shortURL]) {
    return res.status(404).render('statusPages/404', templateVars);
  }
  
  // Return forbidden if user is not owner of the shortURL
  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).render('statusPages/403', templateVars);
  }
  
  // Delete shortURL from DB and redirect to /urls
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

// GET individual shortURL. User can only see thir own.
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const userId = req.session['user_id'];
  const user = users[userId];
  let url = null;
  const templateVars = { url, user, shortURL };
  // Return 404 Page Not Found if DB entry for shortURL does not exist.

  if (!urlDatabase[shortURL]) {
    return res.status(404).render('statusPages/404', templateVars);
  }

  // Return 401 Unauthorized if user is not logged in.
  if (!user) {
    return res.status(401).render('statusPages/401', templateVars);
  }

  // Return 403 Forbidden if user is not the owner of the shortURL.
  if (userId !== urlDatabase[shortURL].userId) {
    return res.status(403).render('statusPages/403', templateVars);
  }

  // Set the url object and render the page for authenticated and authorized user.
  templateVars.url = urlDatabase[shortURL];
  return res.render('urls_show', templateVars);
});

// Edit a urlDatabase entry
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session['user_id'];
  
  // Return 401 Unauthorized if user is not logged in.
  if (!userId) {
    return res.status(401).render('statusPages/401', { user: null });
  }
  
  const { shortURL } = req.params;
  const entry = urlDatabase[shortURL];
  const user = users[userId];
  
  // Return 404 Not Found if database entry for the shortURL is not found.
  if (!entry) {
    return res.satus(404).render('statusPages/404', { user });
  }
  
  // Return 403 Forbidden if logged in user is no the owner of the shortURL.
  if (entry.userId !== userId) {
    return res.status(403).render('statusPages/403', { user });
  }
  
  // Update the database entry and redirect to /urls.
  entry.longURL = req.body.longURL;
  return res.redirect('/urls');
});

// Redirect to external sites route.
app.get('/u/:shortURL', (req, res) => {
  // If a valid address is entered redirect to the appropriate external site.
  const longObj = urlDatabase[req.params.shortURL];
  if (longObj) {
    return res.redirect(longObj.longURL);
  }
  
  // Return 404 Not Found if url is invalid.
  const user = users[req.session['user_id']];
  return res.status(404).render('statusPages/404', { user });
});

// USER ROUTES
// GET login page
app.get('/login', (req, res) => {
  // Redirect to /urls if already logged in.
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  
  // Render login form if not logged in.
  const templateVars = { user: null };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  
  // Return 403 Unauthorized if a valid user object cannot be found.
  if (!user) {
    return res.status(403).render('login', { user: null });
  }

  bcrypt.compare(password, user.password)
    .then(result => {
      if (result) {
        // Set user_id cookie and redirect to /urls for valid sign-in.
        req.session['user_id'] = user.id;
        return res.redirect('/urls');
      }
      // Return 403 Forbidden if signin credentials are invalid.
      return res.status(403).render('login', { user: null });
    })
    .catch(error => {
      // Something went wrong with bcrypt.  Log error and redirect.
      console.log(error);
      return res.redirect('/login');
      // TODO: Make 500 status page.
    });
  
});

app.post('/logout', (req, res) => {
  // Delete cookie and redirect to /url
  req.session = null;
  return res.redirect('/urls');
});

app.get('/register', (req, res) => {
  // Redirect to /urls if already logged in.
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  
  // Render register form
  const templateVars = { user: null };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const templateVars = {
    user: null,
    errorMessage: ''
  };
  
  // Return 400 Bad Request if a blank email or password is submitted.
  if (email === '' || password === '') {
    templateVars.errorMessage = 'A valid email and password are required to register an account.';
    return res.status(400).render('statusPages/400', templateVars);
  }
  
  //  Return 400 Bad Request if the email submitted is already in the database.
  if (getUserByEmail(email, users)) {
    templateVars.errorMessage = `${email} is already in use.`;
    return res.status(400).render('statusPages/400', templateVars);
  }
  
  // Generate new user account, create cookie, and redirect to /urls.
  const id = generateRandomString();
  
  bcrypt.hash(password, 12)
    .then(hash => {
      const newUser = { id, email, password: hash };
      users[id] = newUser;
      req.session['user_id'] = id;
      return res.redirect('/urls');
    })
    .catch(error => {
      // Something went wrong with bcrypt. Log error and redirect back to registration page.
      console.error(error);
      return res.redirect('/register');
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
