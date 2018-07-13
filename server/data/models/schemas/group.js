const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')
const Spend = require('./spend')

module.exports = new Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
        type: ObjectId,
        ref: 'User',
        required: true
    }],
    spends: [Spend]
})