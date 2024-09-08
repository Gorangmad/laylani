const Order = require('../../../models/order')

function escapeRegex(text) {
    return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


function orderController() {
    return {
        async index(req, res) {
            const orders = await Order.find({}, null, { sort: { 'createdAt': -1 }})
                                     .populate('customerId', '-password')
            if(req.xhr) {
                return res.json(orders)
            } else {
                return res.render('admin/orders',  { showNavbar: false })
            }
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            return res.render('admin/singleOrders', { order , showNavbar: false})
        },

        async twodex(req, res) {
            const order = await Order.findById(req.params.id)
            return res.render('admin/total',  { showNavbar: false })
        },

        async threedex(req, res) {
            const orders = await Order.find({}, null, { sort: { 'createdAt': -1 }})
                                     .populate('customerId', '-password')
            if(req.xhr) {
                return res.json(orders)
            } else {
                return res.render('admin/archiv',  { showNavbar: false })
            }
        },
        
        // Function to search orders
        async searchOrders(req, res) {
            let query = {};
        
            console.log(req.query.name)

            if (req.query.name) {
                    const regex = req.query.name; // Create a case-insensitive regex for searching
                    console.log(regex)
                    query = {
                        $or: [
                            { 'name': regex }, // Assuming customerId is populated with the name field
                            { 'email': regex } // Assuming customerId is populated with the email field
                        ]
                    };
            }


            // Fetch orders matching the query
            const orders = await Order.find(query, null, { sort: { 'createdAt': -1 } })
                .populate('customerId', '-password'); // Populate only the necessary fields
        
            console.log(orders)

            return res.render('admin/orders',  { showNavbar: false })
        }
    }
}

module.exports = orderController