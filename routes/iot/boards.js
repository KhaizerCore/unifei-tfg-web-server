const express = require('express');
const router = express.Router();
const boardsController = require('../../controllers/app/boards');

// parameters( path, function(request, response, nextFunction))
// commonAuth.validateUserLoginToken(email, token)
router.get('/', function(req, res) {
    boardsController.retriveBoardData(req, res);
});

// http middleware to authenticate the next requests
router.use(async (req, res, next) => {
    const email = req.headers.email;
    const token = req.headers.token;

    const validated = await commonAuth.validateUserLoginToken(email, token);

    if (validated){
        return next();
    }else{
        res.status(401).send('Autenticacao mal sucedida!');
        return;
    }
});

// commonAuth.validateUserLoginToken(email, token)
router.post('/register', function(req, res) {
    boardsController.requestRegisterBoard(req, res);    
});

// commonAuth.validateUserLoginToken(email, token)
router.post('/control', function(req, res) {
    // MUST PASS in header --> Email and Login Session Token
    // Body must contain a list of outputs and it's values
    boardsController.requestBoardControl(req, res);
});


module.exports = router;