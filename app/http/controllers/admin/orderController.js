const order = require("../../../models/order")

const Order = require('../../../models/order')

function orderController() {
    return {
        index(req, res) {
            order.find({}, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
               if(req.xhr) {
                   return res.json(orders)
               } else {
                return res.render('admin/orders')
               }
           })
        },
        async show(req, res) {

            const order = await Order.findById(req.param._id)
            return res.render('admin/singleOrders', { order })

        
        },
        async twodex(req, res) {

            const order = await Order.findById(req.param._id)
            return res.render('admin/total', { order })

        
        },
        async threedex(req, res) {

            const order = await Order.findById(req.param._id)
            return res.render('admin/archiv', { order })

        
        },



    }

}

module.exports = orderController