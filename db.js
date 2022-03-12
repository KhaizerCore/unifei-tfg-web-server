var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tfg');

var boardSchema = new mongoose.Schema({
        MAC_ADDRESS : String,
        DEVICE_TYPE : String,
        DEVICE_SETUP : Array
}, { collection: 'boardcollection' });

module.exports = { Mongoose: mongoose, BoardSchema: boardSchema};