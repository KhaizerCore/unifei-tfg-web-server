const express = require('express');
const router = express.Router();
const db = require('../../db');

function isEmpty(array) {
    return !array.length;
}

async function userLogin(req, res, User){
    let email = req.body.email;
    let password = req.body.password;
    try{
        let user = await User.find(
            {
                "email": email,
                "password": password
            }
        );
        if (isEmpty(user)) {
            // 401 Login Unauthorized
            res.status(401).send("Login Refused!");
        }else{
            // 202 Login Accepted
            res.status(202).send("Login Accepted!");
        }        
    }catch(e){
        res.status(500).send("Login Error!");
    }
}

router.post('/login', function(req, res) {
    // console.log("body:",req.body);
    // console.log("header token:",req.header);

    let data = req.body;
    
    //console.log("email:",data.email);
    //console.log("password:",data.password);

    userLogin(req, res, db.User);
});

module.exports = router;