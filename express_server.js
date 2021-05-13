const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'TinySession',
  secret: 'tinyURLsessionSecret'
}));

const urlDatabase = {
  b2xVn2: { longURL: 'https://www.tsn.ca', userId: 'b2xVn3' },
  '9sm5xK': { longURL: 'https://www.bing.com', userId: 'b2xVn3' }
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

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = (email) => {
  let user = null;
  for (const id of Object.keys(users)) {
    if (users[id].email === email) {
      user = users[id];
      break;
    }
  }
  return user;
};

const urlsForUser = (id) => {
  const usersUrls = {};
  
  for (const shortURL of Object.keys(urlDatabase)) {
    if (urlDatabase[shortURL].userId === id) {
      usersUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  
  return usersUrls;
};

app.get('/', (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const usersUrls = urlsForUser(userId);
  const templateVars = { user, urls: usersUrls };
  return res.render('urls_index', templateVars);
});

// Create url
app.post('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  
  if (!user) {
    return res.redirect('/login');
  }
  
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    userId,
    longURL: req.body.longURL
  };
  
  return res.redirect(`/urls/${shortUrl}`);
});

// Create url form
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

// Individual url. User can only see thir own.
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const userId = req.session['user_id'];
  const user = users[userId];
  let url = null;
  
  if (userId === urlDatabase[shortURL].userId) {
    url = urlDatabase[shortURL];
  }
  
  const templateVars = { url, user, shortURL };
  
  return res.render('urls_show', templateVars);
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
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

// User Routes

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  
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
  
  if (getUserByEmail(email)) {
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
