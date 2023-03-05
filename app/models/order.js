
const mongoose = require('mongoose')

const Schema = mongoose.Schema


const orderSchema = new Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: { type: Object, required:true },
    totalPrice: { type: String, required:true },
    name: {type: String, required:true},
    phone: {type: String, required:true},
    address: {type: String, default: 'Abholung'},
    lieferType: { type: String, default: 'lieferung'},
    postCode: { type: String, default: '65929'},
    paymentType: { type: String, default: 'COD'},
    paymentStatus: { type: Boolean, default: false},
    status: { type: String, default: 'order_placed'},
    archiv: { type: Boolean, default: true}
}, { timestamps: true})


module.exports = mongoose.model('Order', orderSchema)