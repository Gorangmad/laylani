const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: { type: String, required: true },
    image: {
        type: [String], // This specifies an array of strings
        required: true
      },    comment: { type: String, required: false },
    price: { type: String, required: true },
    category: { type: String, required: false },
    availability: { type: String, enum: ['AVAILABLE', 'SOLDOUT', 'NEW', 'BACK IN', 'WSL', 'HIDDEN'], default: 'AVAILABLE' },
    expiry: { type: Date, required: false },
    sizes: { type: String, required: false },
    relatedMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: false }] // Multiple related menus
}, { timestamps: true });


module.exports = mongoose.model('Menu', menuSchema);
