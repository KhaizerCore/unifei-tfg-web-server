const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const usersController = require('../../controllers/app/users');
const commonAuth = require('../../controllers/common-auth');

router.use('/auth', authRouter);

// No auth needed
router.post('/create', function(req, res) {
    usersController.requestCreateUser(req, res);
});

// No auth needed
router.post('/forgotPass', function(req, res) {
    usersController.requestForgotPassword(req, res);
});

// No auth needed
router.put('/changePass', function(req, res) {
    usersController.requestChangePassword(req, res);
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
router.post('/createLicense', function(req, res) {
    usersController.requestBoardLicenseCreation(req, res);
});

// commonAuth.validateUserLoginToken(email, token)
router.get('/boardLicenses', function(req, res) {
    usersController.requestUserBoardLicenses(req, res);
});

// commonAuth.validateUserLoginToken(email, token)
router.get('/boards', function(req, res) {
    usersController.requestUserBoards(req, res);
});

// commonAuth.validateUserLoginToken(email, token)
router.get('/specific-board', function(req, res) {

    usersController.requestUserSpecificBoard(req, res);
});

// commonAuth.validateUserLoginToken(email, token)
router.put('/change-board-nickname', function(req, res) {
    usersController.requestChangeBoardNickname(req, res);
});

module.exports = router;