const express = require('express');
const router = express.Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');
const Story = require('../models/story');
/**
 * @desc Login/Landing page
 * @routes GET /
 */
router.get('/', ensureGuest, (req, res)=> {
  res.render('login', {layout: 'login'})
})


/**
 * @desc Dashboard
 * @routes GET /dashboard
 */
router.get('/dashboard', ensureAuth, async (req, res)=> {
  const {user} = req
  try {
    const stories = await Story.find({user: user.id}).lean();
    res.render('dashboard', {
      name: user.firstName,
      stories
    });
  } catch (err) {
    console.error(err);
    res.render('error/500')
  }
})
module.exports = router;