const express = require('express');
const bcrypt = require('bcrypt');
const { users } = require('../data');
const { generateRandomString, getUserByEmail } = require('../helpers');

const router = express.Router();

// GET login page
router.get('/login', (req, res) => {
  // Redirect to /urls if already logged in.
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  
  // Render login form if not logged in.
  const templateVars = { user: null };
  return res.render('login', templateVars);
});

router.post('/login', (req, res) => {
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
      console.error(error);
      return res.redirect('/login');
    });
  
});

router.post('/logout', (req, res) => {
  // Delete cookie and redirect to /url
  req.session = null;
  return res.redirect('/urls');
});

router.get('/register', (req, res) => {
  // Redirect to /urls if already logged in.
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  
  // Render register form
  const templateVars = { user: null };
  res.render('register', templateVars);
});

router.post('/register', (req, res) => {
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

module.exports = router;
