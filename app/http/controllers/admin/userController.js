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


        async getAllUsersAsked(req, res) {
            try {
                const allUsers = await User.find();
                res.render('admin/users2', { allUsers , showNavbar: false});
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        },

        async deleteUser(req, res) {
            try {
                const userId = req.body.userId;
                
                // Check if the user exists in the database
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                
                // Delete the user
                await User.findByIdAndDelete(userId);
                
                res.status(200).json({ message: 'User deleted successfully' });
            } catch (error) {
                console.error('Error deleting user:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        },
    

        async search(req, res) {
            // Check if searchTerm exists and is not undefined
            const searchTerm = req.query.searchTerm ? req.query.searchTerm.toLowerCase() : '';
        
            console.log(searchTerm)
        
            try {
                let filteredUsers = [];
        
                // Assuming you have a function to get all users
                const allUsers = await User.find();
        
                if (searchTerm) {
                    filteredUsers = allUsers.filter(user => {
                        const name = user.name ? user.name.toLowerCase() : '';
                        const email = user.email ? user.email.toLowerCase() : '';
                        return name.includes(searchTerm) || email.includes(searchTerm);
                    });
                        } else {
                    filteredUsers = allUsers;
                }
                
                // Ensure you're passing the options correctly
                res.render('admin/users', { allUsers: filteredUsers, showNavbar: false });
            } catch (error) {
                console.log(error);
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
        },

        async getOneUser(req, res){
            try {
                const user = await User.findById(req.params.id); // Assuming Mongoose for MongoDB
                if (!user) {
                    return res.status(404).send('User not found');
                }
                res.render('admin/singleUser', { user, showNavbar:false }); // Render a user detail page
            } catch (error) {
                res.status(500).send('Server error');
            }
        },

        async updateOneUser(req, res) {
            try {
                const { name, email, phone, straße, postleitzahl, land, firmenname } = req.body;
                await User.findByIdAndUpdate(req.params.id, { name, email, phone, straße, postleitzahl, land, firmenname });
                res.status(201).json({ message: 'User details erfolgreich geändert' });
            } catch (error) {
                res.status(500).json({ error: 'Unable to update user' });
            }
        }
        
    }
}

module.exports = userController;
