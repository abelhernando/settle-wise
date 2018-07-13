const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')

module.exports = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: false 
    },
    payer: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    fractions: [{
        user: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }]
})