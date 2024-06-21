
const mongoose = require('mongoose')

const Schema = mongoose.Schema


const orderSchema = new Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: { type: Object, required:true },
    email: {type:String, required: true},
    totalPrice: { type: String, required:true },
    name: {type: String, required:false},
    phone: {type: String, required:false},
    straße: {type: String, required:false},
    postleitzahl: {type: String, required:false},
    land: {type: String, required:false},
    firmenname: {type: String, required:false},
    paymentType: { type: String, default: 'COD'},
    status: { type: String, default: 'order_placed'},
    archiv: { type: Boolean, default: true}
}, { timestamps: true})


module.exports = mongoose.model('Order', orderSchema)