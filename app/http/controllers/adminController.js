const Order = require('../../models/order')
const mongoose = require('mongoose')

function updateItemQuantity() {
    return {
    async index(req, res) {
        const orderId = req.params.orderId.toString();
        const itemId = req.params.itemId.toString();
        const newQty = req.body.qty;

       console.log(orderId)

        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
      
        // Update the item quantity
        if (order.items && order.items[itemId]) {
          order.items[itemId].qty = newQty;
          order.markModified('items'); 
        } else {
          return res.status(404).json({ message: 'Item not found in order' });
        }
        
        // Save the updated order
        try {
          const updatedOrder = await order.save();
          console.log(order._id)
          res.status(200).json({ message: 'Item quantity updated successfully', order: updatedOrder });
        } catch (err) {
          console.log('Error updating item quantity:', err);
          res.status(500).json({ message: 'An error occurred while updating item quantity' });
        }
      }
    }
}

module.exports = updateItemQuantity