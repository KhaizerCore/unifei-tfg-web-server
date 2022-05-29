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

const passwordResetSchema = new mongoose.Schema({
        email : String,
        code : String,
        timestamp : String
}, { collection: 'password_reset_collection' });
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

const loginSchema = new mongoose.Schema({
        email : String,
        token : String,
        timestamp : String
}, { collection: 'logincollection' });
const Login = mongoose.model('Login', loginSchema);

module.exports = { 
        Mongoose: mongoose, 
        BoardSchema: boardSchema, 
        UserSchema: userSchema,
        PasswordResetSchema: passwordResetSchema,
        LoginSchema: loginSchema,
        User : User,
        Board : Board,
        PasswordReset : PasswordReset,
        Login : Login
};