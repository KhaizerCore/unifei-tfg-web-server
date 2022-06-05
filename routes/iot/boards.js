const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

async function retriveBoard(req, res, Board){
    let board = await Board.find();
    console.log("params:",req.params);
    console.log("board:",board);
    res.send(board);
}

async function registerBoard(res, data){
    try {
        let boards = db.Mongoose.model('boardcollection', db.BoardSchema, 'boardcollection');
        var board = new boards({
            MAC_ADDRESS : data.MAC_ADDRESS,
            DEVICE_TYPE : data.DEVICE_TYPE,
            DEVICE_SETUP : data.DEVICE_SETUP
        });
        board.save(
            function(error) {
                if (error) {
                    console.log("Board Registration Failed!");
                    res.status(500).send("Board Registration Failed!");
                } else {
                    console.log("Board Registered Successfully!");
                    res.status(200).send("Board Registered Successfully!");
                }
            }
        );
        
    }catch(err){

    }
}


// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    retriveBoard(req, res, db.Board);
});

router.post('/create', function(req, res) {
    let data = req.body;
    registerBoard(res, data);    
});


module.exports = router;