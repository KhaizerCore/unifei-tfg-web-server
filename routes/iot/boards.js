const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

async function retriveBoardData(req, res){
    try {
        let license_key = req.headers.license_key;
        let board = await db.Board.findOne({
            license_key : license_key
        });
        res.status(200).send(board);
    } catch (error) {
        res.status(500).send();
    }
}

async function licenseInUse(license_key){
    let boards = await db.Board.find({
        license_key: license_key
    });
    return boards.length > 0;
}

async function userHasLicense(email, license_key){
    let userLicenses = await db.User.find({
        email: email,
        license_keys : license_key
    });
    return userLicenses.length > 0;
}

async function registerBoard(res, data){
    try {
        userHasLicense(data.owner_email, data.license_key).then(hasLicense => {
            if (hasLicense){
                licenseInUse(data.license_key).then(inUse => {
                    if (!inUse) {
                        let boards = db.Mongoose.model('boardcollection', db.BoardSchema, 'boardcollection');
                        var board = new boards({
                            owner_email : data.owner_email,
                            license_key : data.license_key,
                            device_nickname : data.device_nickname,
                            device_type : data.device_type,
                            device_setup : data.device_setup
                        });
                        board.save(
                            function(error) {
                                if (error) {
                                    console.log("Board Registration Failed!");
                                    res.status(500).send("Board Registration Failed!");
                                } else {
                                    console.log("Board Registered Successfully!");
                                    res.status(200).send({
                                        'message' : "Board Registered Successfully!"
                                    });
                                }
                            }
                        );
                    }else{
                        console.log("Board Registration Failed!");
                        res.status(500).send("Board Registration Failed!");
                    }
                });
            }else{
                console.log("Board Registration Failed!");
                res.status(500).send("Board Registration Failed!");
            }
        });
    }catch(err){
        console.log("Board Registration Failed!");
        res.status(500).send("Board Registration Failed!");
    }
}


// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    retriveBoardData(req, res);
});

router.post('/register', function(req, res) {
    let data = req.body;
    registerBoard(res, data);    
});


module.exports = router;