const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: { longURL: 'https://www.tsn.ca', userId: 'b2xVn3' },
  '9sm5xK': { longURL: 'https://www.bing.com', userId: 'b2xVn3' }
};

const users = {
  'b2xVn3': {
    id: 'b2xVn3',
    email: 'user@example.com',
    password: 'password'
  },
  'b2xAb7': {
    id: 'b2xAb7',
    email: 'user2@example.com',
    password: 'qwerty'
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
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const usersUrls = urlsForUser(userId);
  const templateVars = { user, urls: usersUrls };
  return res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
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
  const user = users[req.cookies['user_id']];
  
  if (!user) {
    return res.redirect('/login');
  }
  
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Individual url. User can only see thir own.
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const userId = req.cookies['user_id'];
  const user = users[userId];
  let url = null;
  
  if (userId === urlDatabase[shortURL].userId) {
    url = urlDatabase[shortURL];
    console.log(url);
  }
  
  const templateVars = { url, user, shortURL };
  
  return res.render('urls_show', templateVars);
});

// Edit a urlDatabase entry
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  
  if (!user || user.password !== password) {
    return res.status(403).render('login', { user: null });
  }
  
  return res.cookie('user_id', user.id).redirect('/urls');
});

app.post('/logout', (req, res) => {
  return res.clearCookie('user_id').redirect('/urls');
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
  const newUser = { id, email, password };
  users[id] = newUser;

  return res.cookie('user_id', id).redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
