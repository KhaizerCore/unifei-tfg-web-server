const express = require('express');
const router = express.Router();
const appAuthController = require('../../controllers/app/auth');

// No auth
router.post('/login', function(req, res) {
    appAuthController.requestUserLogin(req, res);
});

module.exports = router;