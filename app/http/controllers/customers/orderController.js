const Order = require('../../../models/order')

const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, paymentType, name, lieferType, orderNames } = req.body

            // let totalPrice = req.session.cart.totalPrice

            if(lieferType == 'abholung'){
                if(!phone || !name) {
                    return res.status(422).json({ message : 'All fields are required' });
                }
            } else {
                if(!phone || !name) {
                    return res.status(422).json({ message : 'All fields are required' });
                }
            }


            const order = new Order({
                customerId: req.user._id,
                items: req.body.items,
                name,
                phone,
                lieferType,
                orderNames
            })

            order.save()
                .then(result => {
                    return Order.populate(result, { path: 'customerId' })
                })
                .then(placedOrder => {
                    // Stripe payment
                    if (paymentType !== 'card') {
                        
                        placedOrder.paymentStatus = true;
                        placedOrder.paymentType = paymentType;
                        
                        placedOrder.save().then(ord => {
                          // Emit
                          const eventEmitter = req.app.get('eventEmitter');
                          eventEmitter.emit('orderPlaced', ord);
                          
                          delete req.session.cart;
                          return res.json({ message: 'Order placed successfully' });
                        }).catch(err => {
                          console.log(err);
                          delete req.session.cart;
                          return res.json({ message: 'Failed to place the order' });
                        });
                      } else {
                        delete req.session.cart;
                        return res.json({ message: 'Order placed successfully' });
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
