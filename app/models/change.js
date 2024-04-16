const mongoose = require('mongoose');


// Define the schema for the change log
const changeLogSchema = new mongoose.Schema({
    operationType: String,
    clusterTime: {
        t: Number,
        i: Number
    },
    wallTime: Date,
    ns: {
        db: String,
        coll: String
    },
    documentKey: {
        _id: mongoose.Schema.Types.ObjectId
    },
    updateDescription: {
        updatedFields: {
            name: String,
            sizes: String,
            updatedAt: Date
        },
        removedFields: [String],
        truncatedArrays: [Array]
    },
    user: String
});

// Create a Mongoose model from the schema
const ChangeLog = mongoose.model('ChangeLog', changeLogSchema);

module.exports = ChangeLog;
