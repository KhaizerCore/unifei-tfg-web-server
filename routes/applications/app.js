const express = require('express');
const router = express.Router();

// defining userRouter path --> every get, set, post and delete will be in /users path
const userRouter = require('./users');
router.use('/users', userRouter);

module.exports = router;