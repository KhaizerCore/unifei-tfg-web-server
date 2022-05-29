const express = require('express');
const router = express.Router();
const db = require('../../db');

async function retriveBoard(req, res, Board){
    let board = await Board.find();
    console.log("params:",req.params);
    console.log("board:",board);
    res.send(board);
}

// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    retriveBoard(req, res, db.Board);
});

router.post('/create', function(req, res) {
    // console.log("body:",req.body);
    // console.log("header token:",req.header);
    
    let data = req.body;
    let boards = db.Mongoose.model('boardcollection', db.BoardSchema, 'boardcollection');
    var board = new boards({
        MAC_ADDRESS : data.MAC_ADDRESS,
        DEVICE_TYPE : data.DEVICE_TYPE,
        DEVICE_SETUP : data.DEVICE_SETUP
    });
    board.save(
        function(error) {
            if (error) {
                console.log("deu ruim 1");
            } else {
                console.log("deu baum 1");
            }
        }
    );
    
    res.send("ok");
});

router.route('/:id')
    .get(
        function(req, res) {
            let id = req.params.id;
            res.send("Board Get " + id);
        }
    ).put(
        function(req, res) {
            let id = req.params.id;
            res.send("Board Put " + id);
        }
    ).delete(
        function(req, res) {
            let id = req.params.id;
            res.send("Board Delete " + id);
        }
    );

// Every time that finds passed param do the following (in any existing route):
router.param("id", function(req, res, next, id) {
    console.log(id);
});


module.exports = router;