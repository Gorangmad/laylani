
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
    name: {type: String, required:true},
    phone: {type: String, required:true},
    straße: {type: String, required:true},
    postleitzahl: {type: String, required:false},
    land: {type: String, required:true},
    firmenname: {type: String, required:true},
    paymentType: { type: String, default: 'COD'},
    status: { type: String, default: 'order_placed'},
    archiv: { type: Boolean, default: true}
}, { timestamps: true})


module.exports = mongoose.model('Order', orderSchema)