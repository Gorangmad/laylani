const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            // Check if email exists
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            // Ensure user has a password set
            if (!user.password) {
                return done(null, false, { message: 'Password not set for this user' });
            }

            // Compare passwords
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return done(err);
                }
                if (match) {
                    return done(null, user, { message: 'Logged in successfully' });
                } else {
                    return done(null, false, { message: 'Wrong username or password' });
                }
            });
        } catch (err) {
            console.error('Error in local strategy:', err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                console.error('Error deserializing user:', err);
                done(err, null);
            });
    });
}

module.exports = init;
