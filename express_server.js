const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const csrf = require('csurf');

const authRoutes = require('./routes/auth-routes');
const urlRoutes = require('./routes/url-routes');
const { users } = require('./data');

const app = express();
const csrfProtection = csrf();
const PORT = 8080;

// Options
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'TinySession',
  secret: 'tinyURLsessionSecret'
}));
app.use(csrfProtection);

// Make isLoggedIn and user info available in views
app.use((req, res, next) => {
  const userId = req.session['user_id'];
  res.locals.isLoggedIn = userId ? true : false;
  res.locals.user = users[userId];
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Add user object to each request
app.use((req, res, next) => {
  req.user = users[req.session['user_id']];
  next();
});

// Routing
app.use(authRoutes);
app.use(urlRoutes);

// Listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
