const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
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
        required: true,
        min: 1,
        default: 1
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    purchaseDate: {
        type: String,
        default: new Date().toLocaleDateString("en-Us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    }
});

module.exports = mongoose.model('Stock', stockSchema);
