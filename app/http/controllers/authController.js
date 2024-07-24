const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const initializeChangeStream = require('../../../server');



function authController() {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nichtantwortenbb@gmail.com',
          pass: 'ahsyptlxsejgdyra'
        }
    });


    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/'
    }

    return {
        login(req, res) {
            res.render('auth/login')
        },

        postLogin(req, res, next) {
            const { email, password } = req.body;
            // Validate request
            if (!email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/login');
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }

                // Check if the user has the isUser property set to true
                if (user.isUser !== "angenommen") {
                    req.flash('error', 'You do not have permission to log in.');
                    return res.redirect('/login');
                }

                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message);
                        return next(err);
                    }
                    initializeChangeStream(req.user.email);
                    return res.redirect(_getRedirectUrl(req));
                });
            })(req, res, next);
        },

        

        register(req, res) {
            res.render('auth/register')
        },

        resetpassword(req, res) {

            res.render('auth/reset')

        },

        wiederherstellung(req, res) {
            res.render('auth/wiederherstellung')
        },

        setPasswortScreen(req, res) {
            res.render('auth/setPasswort.ejs')
        },


        async setPasswort(req, res) {
            const email = req.body.email;
            const password = req.body.Passwort;
        
            try {
                // Check if the user exists in the database
                const user = await User.findOne({email})
        
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
        
                // Check if the user's password field is empty or null
                if (!user.password) {
                    // Encrypt the provided password
                    const hashedPassword = await bcrypt.hash(password, 10);
        
                    // Update the user's password field in the database
                    user.password = hashedPassword;
                    await user.save();
        
                    return res.render('auth/success.ejs'); // Assuming you have a view named 'passwordSetSuccess'
                } else {
                    return res.status(400).json({ error: 'User already has a password set' });
                }
            } catch (error) {
                console.error('Error setting password:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        },
        


        async wiederherstellen(req, res) {
            const { email } = req.body;
            const user = await User.findOne({email: email}); // Function to find user by email
            if (!user) {
                return res.status(404).send('User not found');
            }
        
            function generateResetToken() {
                return crypto.randomBytes(20).toString('hex');
            };

        
            function sendResetEmail(email, resetLink) {

                const mailOptions = {
                    from: 'nichtantwortenbb@gmail.com',
                    to: email,
                    subject: 'Passwort Zurücksetzen Bahl Collection',
                    text: 'Bitte drücken sie auf den folgenden Link um ihr Passwort zurückzusetzen: ' + resetLink
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

            }7

            async function storeTokenForUser(userId, token) {
                try {
                    const tokenExpiration = new Date();
                    tokenExpiration.setHours(tokenExpiration.getHours() + 1);
            
                    await User.updateOne({ _id: userId }, { 
                        resetPasswordToken: token,
                        resetPasswordExpires: tokenExpiration
                    });
            
                } catch (error) {
                    console.error('Error in storeTokenForUser:', error);
                    throw error; // Rethrow the error to handle it in the calling context
                }
            };



            const resetToken = generateResetToken(); // Function to generate a unique token
            await storeTokenForUser(user.id, resetToken); // Store the token in the database
        
            const resetLink = `https://plankton-app-tj2qs.ondigitalocean.app/reset-password?token=${resetToken}`;
            await sendResetEmail(email, resetLink); // Function to send the email
        
            res.send('Password reset email sent');
        },

        async neuesPasswort(req, res) {
            let token;
        
            if (req.headers.referer) {
                const refererUrl = new URL(req.headers.referer);
                token = refererUrl.searchParams.get('token');
                token = String(token);
            }
        
            if (!token) {
                return res.status(400).send('Token is missing or invalid.');
            }
        
            const password1 = req.body.Passwort[0];
            const password2 = req.body.Passwort[1];
        
            if (password1 !== password2) {
                return res.status(400).send('Passwords do not match.');
            }
        
            const saltRounds = 10;
        
            try {
                console.log(token);
        
                const hash = await bcrypt.hash(password1, saltRounds);
                // Find user by token
                const user = await User.findOne({ resetPasswordToken: token });
        
                if (!user) {
                    return res.status(400).send('Password reset token is invalid or has expired.');
                }
        
                // Update user's password and clear reset token fields
                await User.updateOne({ _id: user._id }, { 
                    $set: { password: hash },
                    $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
                });
        
                res.render('home');
            } catch (error) {
                if (!res.headersSent) {
                    console.log(error);
                    res.status(500).send('An error occurred.');
                }
            }
        },
        
        


        async update(req, res) {
            const { name, email, password, phone, straße, postleitzahl, land, firmenname, stadt, VAT } = req.body;

            // Validate request
            if (!name || !email || !password || !phone || !straße || !postleitzahl || !land || !firmenname) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }
        
            try {
                // Check if email exists in the Users collection
                const existingUser = await User.findOne({ email: email });
        
                if (existingUser) {
                    req.flash('error', 'Email already taken');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }
        
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
        
                // Create a user in the Users collection
                const newUser = new User({
                    name,
                    email,
                    phone,
                    password: hashedPassword,
                    straße,
                    postleitzahl,
                    stadt,
                    VAT,
                    land,
                    firmenname,
                });
        
                await newUser.save();

                const mailOptions = {
                    from: 'nichtantwortenbb@gmail.com',
                    to: email,
                    subject: 'Registration Confirmation',
                    text: 'Sehr geehrter Kunde,\n\nvielen Dank für Ihre Registrierung. Unser Team wird Ihnen eine Bestätigung senden, sobald Ihre Registrierung abgeschlossen ist.\n\nBitte beachten Sie, dass Sie zusätzlich einen Nachweis Ihres Gewerbes per E-Mail an uns senden müssen.\n\nMit freundlichen Grüßen,\nIhr Bahl Collection Team'
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                // Redirect to a different page or handle users differently
                return res.redirect('/');
            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }
        },

        logout(req, res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

module.exports = authController
