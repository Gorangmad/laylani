
const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userSchema = new Schema({
    CustomerNumber: { type: Number, required: false},
    name: { type: String, required: false},
    email: { type: String, required: false},
    password: { type: String, required: false},
    phone: {type: String, required: false},
    straße: {type: String, required: false},
    postleitzahl: {type: String, required: false},
    stadt: {type: String, required: false},
    land: {type: String, required: false},
    firmenname: {type: String, required: false},
    VAT: {type:String, required: false},
    resetPasswordToken: {type:String, required: false},
    resetPasswordExpires: {type: Date, required: false},
    role: { type: String, default: 'customer'},
    isUser: {
        type: String,
        enum: ['angefragt', 'bearbeitet', 'angenommen'], 
        default: 'angefragt'
    }   
}, { timestamps: true})


module.exports = mongoose.model('User', userSchema)