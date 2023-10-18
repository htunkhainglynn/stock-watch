const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    company: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Stock', stockSchema);
