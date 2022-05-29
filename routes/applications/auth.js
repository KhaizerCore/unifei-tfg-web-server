const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

async function validateEmailPassword(email, password) {
    let User = db.User;
    let validation = await User.find({
        email : email,
        password : password
    });
    return validation.length > 0;
}

async function saveLoginRegister(email, token) {
    let logins = db.Mongoose.model('logincollection', db.LoginSchema, 'logincollection');
    let login = new logins({
        email : email,
        token : token,
        timestamp : new Date().getTime()
    });
    login.save(
        function(error) {
            if (error) {
                console.log("Login Authentication Register Creating Failed!");
            } else {
                console.log("Login Authentication Register Created Successfully!");
            }
        }
    );
}

async function removeAllLoginRegisters(email){
    let Login = db.Login;
    let login = await Login.deleteMany({
        email : email
    }).then(result => {
    });
}

async function userLogin(req, res, User){
    let email = req.body.email;
    let password = req.body.password;
    try{
        validateEmailPassword(email, password).then( validated => {
            if (validated){
                removeAllLoginRegisters(email).then(() => {
                    let token = uuidv4();
                    saveLoginRegister(email, token).then(() => {
                        // 202 Login Accepted
                        res.status(202).header({
                            'Authorization' : token
                        }).send();
                        console.log("Login Accepted!");
                    });                  
                });
            }else{
                // 401 Login Unauthorized
                res.status(401).send("Login Refused!");
            }
        });    
    }catch(e){
        // 500 Login Error
        res.status(500).send("Login Error!");
    }
}

router.post('/login', function(req, res) {
    userLogin(req, res, db.User);
});

module.exports = router;