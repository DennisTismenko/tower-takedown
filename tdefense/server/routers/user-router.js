const express = require('express');
const User = require('../model/user');
const Stat = require('../model/stat');
const { body, validationResult } = require('express-validator/check');
const router = new express.Router();

router.post('/register', [body('email').trim().escape().isEmail().normalizeEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.createNewUser(req.body.email, req.body.password);
    await Stat.createNewStat(req.body.email);
    req.session.user = user;
    res.status(201).json(user);
  } catch (e) {
    res.status(400).end('Bad request');
  }
});

router.post('/login', [body('email').trim().escape().normalizeEmail()], async (req, res) => {
  try {
    const { user, error } = await User.authenticate(req.body.email, req.body.password);
    if (error) {
      res.status('500').end(error.message);
    }
    if (user) {
      req.session.user = user;
      res.json(user);
    } else {
      res.status('403').end('Failed to authenticate user.');
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/logout', (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy();
    res.end('Signed off.');
  } else {
    res.status('400').end('No valid session found.');
  }
});

router.get('/isAuthenticated', (req, res) => {
  res.json({ authenticated: (req.session && req.session.user) ? true : false });
});

module.exports = router;
