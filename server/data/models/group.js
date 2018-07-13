const mongoose = require('mongoose')
const { Group} = require('./schemas')

module.exports = mongoose.model('Group', Group)