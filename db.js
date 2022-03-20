const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tfg');

const boardSchema = new mongoose.Schema({
        MAC_ADDRESS : String,
        DEVICE_TYPE : String,
        DEVICE_SETUP : Array
}, { collection: 'boardcollection' });
const Board = mongoose.model('Board', boardSchema);

const userSchema = new mongoose.Schema({
        name : String,
        email : String,
        cellphone : String,
        password : String
}, { collection: 'usercollection' });
const User = mongoose.model('User', userSchema);

module.exports = { 
        Mongoose: mongoose, 
        BoardSchema: boardSchema, 
        UserSchema: userSchema,
        User: User,
        Board: Board
};