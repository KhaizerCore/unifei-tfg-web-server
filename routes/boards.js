const express = require('express');
const router = express.Router();

// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    res.send("Board List");
});

router.get('/new', function(req, res) {
    res.send("Board New Form");
});

router.post('/create', function(req, res) {
    res.send("Create Board");
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