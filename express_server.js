const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
