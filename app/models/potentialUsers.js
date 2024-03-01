
const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    phone: {type: String, required: true},
    role: { type: String, default: 'customer'},
    isUser: {
        type: String,
        enum: ['angefragt', 'bearbeitet', 'angenommen'], // Allowed values for isUser
        default: 'angefragt' // Default value
    }
}, { timestamps: true})


module.exports = mongoose.model('PotentialUser', userSchema)