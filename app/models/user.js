
const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    phone: {type: String, required: true},
    straße: {type: String, required: true},
    postleitzahl: {type: String, required: true},
    land: {type: String, required: true},
    firmenname: {type: String, required: true},
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