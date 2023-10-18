const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
    company: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: String,
        default: new Date().toLocaleDateString("en-Us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    },
    type: {
        type: String
    }
});

module.exports = mongoose.model('History', historySchema);