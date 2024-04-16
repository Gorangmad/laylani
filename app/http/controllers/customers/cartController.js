const { json } = require("express")

function cartController() {
    return {
        success(req,res ){
            res.render('success')
        },

        index(req, res) {
            res.render('customers/cart')
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
        
            // Check if item does not exist in cart
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = newItem;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + Number(req.body.price);
                console.log(cart.totalPrice)
            } else {
                // Check if sizes are the same
                const sizesInCart = cart.items[req.body._id].item.sizes;
                const newSizes = req.body.sizes;
        
                if (sizesInCart === newSizes) {
                    // Update the qty for the existing product
                    cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                    cart.totalQty = cart.totalQty + 1;
                    cart.totalPrice = cart.totalPrice + Number(req.body.price);
                } else {
                    // Sizes are different, create a new entry
                    const newId = req.body._id + newSizes;
                    cart.items[newId] = newItem;
                    cart.totalQty = cart.totalQty + 1;
                    cart.totalPrice = cart.totalPrice + req.body.price;
                }
            }
        
            return res.json({ totalQty: req.session.cart.totalQty , cartItems: req.session.cart.items, totalPrice: req.session.cart.totalPrice});
        },
        
              


        remove(req, res) {
            let cart = req.session.cart;
            if (cart.totalQty > 0) {
              cart.totalQty = cart.totalQty - 1;
              cart.totalPrice = cart.totalPrice - req.body.price;

              if (cart.items[req.body._id].qty === 1) {
                delete cart.items[req.body._id];
              } else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty - 1;
              }
              if (cart.totalQty === 0) {
                delete req.session.cart;
              }
            }
            let totalQty = cart ? cart.totalQty : 0;
            return res.json({ totalQty: totalQty, cartItems: cart.items, totalPrice: cart.totalPrice });
        },
    }
}

module.exports = cartController