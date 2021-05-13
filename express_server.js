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
  
  if (!user) {
    return res.status(401).render('statusPages/401', { user });
  }
  
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
  
  if (!user) {
    return res.redirect('/login');
  }
  
  const templateVars = { user };
  return res.render('urls_new', templateVars);
});

// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session['user_id'];
  const { shortURL } = req.params;
  
  if (urlDatabase[shortURL].userId === userId) {
    delete urlDatabase[shortURL];
  }
  
  return res.redirect('/urls');
});

// GET individual shortURL. User can only see thir own.
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const userId = req.session['user_id'];
  const user = users[userId];
  let url = null;
  let statusCode = 200;
  let errorMessage = 'This short url does not belong to you.';
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).render('statusPages/404', { user });
  }
  
  if (!user) {
    return res.status(401).render('statusPages/401', { user });
  }
  
  if (urlDatabase[shortURL] && userId === urlDatabase[shortURL].userId) {
    url = urlDatabase[shortURL];
  }
  
  const templateVars = { url, user, shortURL, errorMessage };
  
  return res.status(statusCode).render('urls_show', templateVars);
});

// Edit a urlDatabase entry
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session['user_id'];
  const { shortURL } = req.params;
  
  if (urlDatabase[shortURL].userId === userId) {
    urlDatabase[shortURL].longURL = req.body.longURL;
  }
  
  return res.redirect('/urls');
});

// Redirect route
app.get('/u/:shortURL', (req, res) => {
  const longObj = urlDatabase[req.params.shortURL];
  if (longObj) {
    return res.redirect(longObj.longURL);
  }
  const user = users[req.session['user_id']];
  return res.status(404).render('statusPages/404', { user });
});

// User Routes

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).render('login', { user: null });
  }

  bcrypt.compare(password, user.password)
    .then(result => {
      if (result) {
        req.session['user_id'] = user.id;
        return res.redirect('/urls');
      }
      return res.status(403).render('login', { user: null });
    })
    .catch(error => {
      console.log(error);
      return res.redirect('/login');
    });
  
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  if (email === '' || password === '') {
    return res.status(400).render('register', { user: null });
  }
  
  if (getUserByEmail(email, users)) {
    return res.status(400).render('register', { user: null });
  }
  
  const id = generateRandomString();
  
  bcrypt.hash(password, 12)
    .then(hash => {
      const newUser = { id, email, password: hash };
      users[id] = newUser;
      req.session['user_id'] = id;
      return res.redirect('/urls');
    })
    .catch(error => {
      console.log(error);
      return res.redirect('/register');
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
