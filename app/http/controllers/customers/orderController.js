const Order = require('../../../models/order')

const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, stripeToken, paymentType, name, lieferType } = req.body

            let totalPrice = req.session.cart.totalPrice

            if(lieferType == 'abholung'){
                if(!phone || !name) {
                    return res.status(422).json({ message : 'All fields are required' });
                }
            } else {
                if(!phone || !name) {
                    return res.status(422).json({ message : 'All fields are required' });
                }
            }

            if(req.body.postCode === '65929'){
                totalPrice = req.session.cart.totalPrice + 0
            }
            if(req.body.postCode === '65936'){
                totalPrice = req.session.cart.totalPrice + 1
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                name,
                phone,
                lieferType,
                totalPrice
            })

            order.save()
                .then(result => {
                    return Order.populate(result, { path: 'customerId' })
                })
                .then(placedOrder => {
                    // Stripe payment
                    if(paymentType === 'card') {
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice  * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true
                            placedOrder.paymentType = paymentType
                            return placedOrder.save()
                        }).then(ord => {
                            // Emit
                            const eventEmitter = req.app.get('eventEmitter')
                            eventEmitter.emit('orderPlaced', ord)
                            delete req.session.cart
                            return res.json({ message : 'Payment successful, Order placed successfully' });
                        }).catch((err) => {
                            console.log(err)
                            delete req.session.cart
                            return res.json({ message : 'OrderPlaced but payment failed, You can pay at delivery time' });
                        })
                    } else {
                        delete req.session.cart
                        return res.json({ message : 'Order placed succesfully' });
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
