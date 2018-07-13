const mongoose = require('mongoose')
const { Spend} = require('./schemas')

module.exports = mongoose.model('Spend', Spend)