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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log('called');
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.post('/login', (req, res) => {
  res
    .cookie('username', req.body.username)
    .redirect('/urls');
});

app.post('/logout', (req, res) => {
  res
    .clearCookie('username')
    .redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { username: '' };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = { id, email, password };
  users[id] = newUser;
  console.log('users', users);
  res
    .cookie('user_id', id)
    .redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
