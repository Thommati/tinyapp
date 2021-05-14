const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');

const authRoutes = require('./routes/auth-routes');
const urlRoutes = require('./routes/url-routes');

const app = express();
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
app.use(authRoutes);
app.use(urlRoutes);

// Listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
