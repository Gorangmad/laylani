const PotentialUser = require('../../../models/potentialUsers');
const User = require('../../../models/user');
const nodemailer = require('nodemailer')

function userController() {
    return {
        async getAllUsers(req, res) {
            try {
                const allUsers = await User.find();
                res.render('admin/users', { allUsers , showNavbar: false});
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        },

        

        async search(req, res) {
            // Check if searchTerm exists and is not undefined
    const searchTerm = req.query.searchTerm ? req.query.searchTerm.toLowerCase() : '';

    try {
        let filteredUsers = [];

        // Assuming you have a function to get all users
        const allUsers = await User.find();

        if (searchTerm) {
            filteredUsers = allUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        } else {
            filteredUsers = allUsers;
        }

        res.render('admin/users', { allUsers: filteredUsers }, { showNavbar: false });
    } catch (error) {
    
        res.status(500).send('Server error');
    }
        },



        async changeUserStatus(req, res) {
            const { userId, status } = req.body;

            try {
                // Find the user by ID
                const user = await User.findById(userId);

                if (!user) {
                    return res.status(404).send('User not found');
                }

                // Save the current status for comparison later
                const previousStatus = user.isUser;

                // Update the status
                user.isUser = status;
                await user.save();

                // Send email if the status is changed
                if (previousStatus !== status) {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'nichtantwortenbb@gmail.com',
                          pass: 'ahsyptlxsejgdyra'
                        }
                      });
    
                    const mailOptions = {
                        from: 'nichtantwortenbb@gmail.com',
                        to: user.email,
                        subject: 'Login Confirmation',
                        text: 'Congratulations! You are now a Partner of Bahl Collection. Come and view our variety of silver jewelry'
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }

                // Redirect back to the page where the status was changed
                res.redirect('/admin/users');
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        },

        async render(req, res) {

            return res.render('admin', { showNavbar: false });
        }
    }
}

module.exports = userController;
