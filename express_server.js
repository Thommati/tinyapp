const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const router = require('./routes');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'TinySession',
  secret: 'tinyURLsessionSecret'
}));
app.use(router);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
