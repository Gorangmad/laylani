const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: { type: String, required: true },
    image: {
        type: [String], // This specifies an array of strings
        required: true
    },
    comment: { type: String, required: false },
    price: { type: Schema.Types.Mixed, required: true }, // Allow both string and array
    category: { type: String, required: false },
    availability: { type: String, enum: ['AVAILABLE', 'SOLDOUT', 'NEW', 'BACK IN', 'WSL', 'HIDDEN'], default: 'AVAILABLE' },
    expiry: { type: Date, required: false },
    sizes: { type: Schema.Types.Mixed, required: false }, // Allow both string and array
    relatedMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: false }], // Multiple related menus
    isChecked: { type: Boolean, default: false } // New field for checked status
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
