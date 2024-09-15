const Order = require('../../models/order')
const Category = require('../../models/categories')
const mongoose = require('mongoose')

function updateItemQuantity() {
  return {
    async index(req, res) {
      const { id, visibility } = req.body;

      // Validate the input
      if (!id || visibility === undefined) {
          return res.status(400).json({ success: false, error: 'Invalid input' });
      }
  
      try {
          // Update the category in the database using async/await
          const updatedCategory = await Category.findByIdAndUpdate(
              id,
              { Visibility: visibility },
              { new: true }
          );
  
          if (!updatedCategory) {
              return res.status(404).json({ success: false, error: 'Category not found' });
          }
  
          res.json({ success: true });
      } catch (err) {
          console.error('Error updating visibility:', err);
          res.status(500).json({ success: false, error: 'Database update failed' });
      }
    }
  };
}



module.exports = updateItemQuantity