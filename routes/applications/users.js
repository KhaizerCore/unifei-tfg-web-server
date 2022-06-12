const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const usersController = require('../../controllers/app/users');

router.use('/auth', authRouter);


router.post('/create', function(req, res) {
    usersController.requestCreateUser(req, res);
});

router.post('/forgotPass', function(req, res) {
    usersController.requestForgotPassword(req, res);
});

router.put('/changePass', function(req, res) {
    usersController.requestChangePassword(req, res);
});

router.post('/createLicense', function(req, res) {
    usersController.requestBoardLicenseCreation(req, res);
});

router.get('/boardLicenses', function(req, res) {
    usersController.requestUserBoardLicenses(req, res);
});

router.get('/boards', function(req, res) {
    usersController.requestUserBoards(req, res);
});

module.exports = router;