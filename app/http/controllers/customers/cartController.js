function cartController() {
    return {
        success(req, res) {
            res.render('success');
        },

        index(req, res) {
            res.render('customers/cart');
        },

        update(req, res) {
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                };
            }
            let cart = req.session.cart;

            const newItem = {
                item: req.body,
                qty: 1
            };

            const uniqueKey = `${req.body._id}_${req.body.sizes}`;

            if (!cart.items[uniqueKey]) {
                cart.items[uniqueKey] = newItem;
                cart.totalQty += 1;
                cart.totalPrice += Number(req.body.price);
            } else {
                cart.items[uniqueKey].qty += 1;
                cart.totalQty += 1;
                cart.totalPrice += Number(req.body.price);
            }

            return res.json({
                totalQty: req.session.cart.totalQty,
                cartItems: req.session.cart.items,
                totalPrice: req.session.cart.totalPrice,
                size: req.body.sizes
            });
        },

        remove(req, res) {
            let cart = req.session.cart;
            const uniqueKey = `${req.body._id}_${req.body.sizes}`;

            if (cart.totalQty > 0 && cart.items[uniqueKey]) {
                cart.totalQty -= 1;
                cart.totalPrice -= req.body.price;

                if (cart.items[uniqueKey].qty === 1) {
                    delete cart.items[uniqueKey];
                } else {
                    cart.items[uniqueKey].qty -= 1;
                }

                if (cart.totalQty === 0) {
                    delete req.session.cart;
                }
            }
            let totalQty = cart ? cart.totalQty : 0;
            return res.json({
                totalQty: totalQty,
                cartItems: cart.items,
                totalPrice: cart.totalPrice
            });
        },
    }
}

module.exports = cartController;
