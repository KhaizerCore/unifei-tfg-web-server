const express = require('express');
const router = express.Router();
const boardsController = require('../../controllers/app/boards');

// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    boardsController.retriveBoardData(req, res);
});

router.post('/register', function(req, res) {
    boardsController.requestRegisterBoard(req, res);    
});

router.post('/control', function(req, res) {
    // MUST PASS in header --> Email and Login Session Token
    // Body must contain a list of outputs and it's values
    boardsController.requestBoardControl(req, res);
});


module.exports = router;