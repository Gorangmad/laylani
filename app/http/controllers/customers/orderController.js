const Order = require('../../../models/order')

const moment = require('moment')

function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { paymentType } = req.body


            let totalPrice = req.session.cart.totalPrice


            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                email: req.user.email,
                name: req.user.name,
                phone: req.user.phone,
                straße: req.user.straße,
                postleitzahl: req.user.postleizahl,
                land: req.user.land,
                firmenname: req.user.firmenname,
                totalPrice: totalPrice
            })

            order.save()
                .then(result => {
                    return Order.populate(result, { path: 'customerId' })
                })
                .then(placedOrder => {
                    // Stripe payment
                    if (paymentType !== 'card' && paymentType !== undefined) {
                        
                        placedOrder.paymentStatus = true;
                        placedOrder.paymentType = paymentType;
                        
                        placedOrder.save().then(ord => {
                          // Emit
                          const eventEmitter = req.app.get('eventEmitter');
                          eventEmitter.emit('orderPlaced', ord);
                          
                          delete req.session.cart;
                          return res.redirect("/success");
                        }).catch(err => {
                          console.log(err);
                          delete req.session.cart;
                          return res.json({ message: 'Failed to place the order' });
                        });
                      } else {
                        delete req.session.cart;
                        return res.redirect("/success");
                      }
                      
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({ message : 'Something went wrong' });
                })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } } )
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return  res.redirect('/')
        }
    }
}

module.exports = orderController;
