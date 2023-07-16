const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { success: false, data: null, error: 'Invalid username' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return done(null, false, { success: false, data: null, error: 'Invalid password' });
    }

    return done(null, user, { success: true, data: { user }, error: null });
  } catch (err) {
    return done(err, false, { success: false, data: null, error: 'Internal Server Error' });
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user, { success: true, data: { user }, error: null });
  } catch (err) {
    done(err, false, { success: false, data: null, error: 'Internal Server Error' });
  }
});

module.exports = passport;
