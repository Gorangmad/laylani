const Order = require('../../models/order')
const mongoose = require('mongoose')

function updateItemQuantity() {
  return {
    async index(req, res) {
      const orderId = req.params.orderId.toString();
      const itemId = req.params.itemId.toString();
      const quantityType = Object.keys(req.body)[0]; // Get the first (and only) key in req.body
      const newQty = req.body[quantityType]; // Access the quantity value based on the key

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.items && order.items.length > 0) {
        const itemToUpdate = order.items.find((item) => item.pizza._id === itemId);

        if (itemToUpdate) {
          // Update the appropriate quantity based on quantityType
          if (quantityType === 'quantity1') {
            itemToUpdate.quantity1 = newQty;
          } else if (quantityType === 'quantity2') {
            itemToUpdate.quantity2 = newQty;
          } else if (quantityType === 'quantity3') {
            itemToUpdate.quantity3 = newQty;
          }else if (quantityType === 'quantity4') {
            itemToUpdate.quantity4 = newQty;
          }else if (quantityType === 'quantity5') {
            itemToUpdate.quantity5 = newQty;
          }else if (quantityType === 'quantity6') {
            itemToUpdate.quantity6 = newQty;
          }else if (quantityType === 'quantity7') {
            itemToUpdate.quantity7 = newQty;
          }else if (quantityType === 'quantity8') {
            itemToUpdate.quantity8 = newQty;
          }else if (quantityType === 'quantity9') {
            itemToUpdate.quantity9 = newQty;
          }else if (quantityType === 'quantity10') {
            itemToUpdate.quantity10 = newQty;
          }else if (quantityType === 'quantity11') {
            itemToUpdate.quantity11 = newQty;
          }else if (quantityType === 'quantity12') {
            itemToUpdate.quantity12 = newQty;
          }else if (quantityType === 'quantity13') {
            itemToUpdate.quantity13 = newQty;
          }else if (quantityType === 'quantity14') {
            itemToUpdate.quantity14 = newQty;
          }else if (quantityType === 'quantity15') {
            itemToUpdate.quantity15 = newQty;
          }else if (quantityType === 'quantity16') {
            itemToUpdate.quantity16 = newQty;
          }else if (quantityType === 'quantity17') {
            itemToUpdate.quantity17 = newQty;
          }else if (quantityType === 'quantity18') {
            itemToUpdate.quantity18 = newQty;
          }else if (quantityType === 'quantity19') {
            itemToUpdate.quantity19 = newQty;
          }else if (quantityType === 'quantity20') {
            itemToUpdate.quantity20 = newQty;
          }else if (quantityType === 'quantity21') {
            itemToUpdate.quantity21 = newQty;
          }else if (quantityType === 'quantity22') {
            itemToUpdate.quantity22 = newQty;
          }else if (quantityType === 'quantity23') {
            itemToUpdate.quantity23 = newQty;
          }else if (quantityType === 'quantity24') {
            itemToUpdate.quantity24 = newQty;
          }
          else {
            return res.status(400).json({ message: 'Invalid quantity type' });
          }

          order.markModified('items');
        } else {
          return res.status(404).json({ message: 'Item not found in order' });
        }
      } else {
        return res.status(404).json({ message: 'No items found in order' });
      }

      // Save the updated order
      try {
        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Item quantity updated successfully', order: updatedOrder });
      } catch (err) {
        console.log('Error updating item quantity:', err);
        res.status(500).json({ message: 'An error occurred while updating item quantity' });
      }
    },
  };
}



module.exports = updateItemQuantity