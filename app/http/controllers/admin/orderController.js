const Order = require('../../../models/order')

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
            return res.render('admin/singleOrders', { order })
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
    }
}

module.exports = orderController