const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    comment: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: false },
    availability: { type: String, enum: ['available', 'sold out', 'new', 'back in', 'WSL'], default: 'available' },
    expiry: { type: Date, required: false },
    sizes: { type: String, required: true },
    relatedMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: false }] // Multiple related menus
});


module.exports = mongoose.model('Menu', menuSchema);
