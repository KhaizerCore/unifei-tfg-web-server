const express = require('express');
const router = express.Router();

const boardRouter = require('./boards');
router.use('/boards', boardRouter);

module.exports = router;