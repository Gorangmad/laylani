const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  No: {
    type: String,
    required: true,
    unique: true // Assuming 'No' is a unique identifier
  },
  Parent_Category: {
    type: String,
    required: true // Change this to false if 'Parent Category' can be empty
  },
  Global_Rank: {
    type: String,
    required: true
  },
  Visibility: {
    type: String,
    required: true
  },
  subcategories: [{
    name: String,
    No: String,
    Visibility: String,
    Global_Rank: String
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
