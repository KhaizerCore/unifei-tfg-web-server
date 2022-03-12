const express = require('express');
const router = express.Router();

// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    res.send("User List");
});

router.get('/new', function(req, res) {
    res.send("User New Form");
});

router.post('/create', function(req, res) {
    console.log("req:", req.body);
    res.send("Create User");
});

router.route('/:id')
    .get(
        function(req, res) {
            let id = req.params.id;
            res.send("User Get " + id);
        }
    ).put(
        function(req, res) {
            let id = req.params.id;
            res.send("User Put " + id);
        }
    ).delete(
        function(req, res) {
            let id = req.params.id;
            res.send("User Delete " + id);
        }
    );

// Every time that finds passed param do the following (in any existing route):
router.param("id", function(req, res, next, id) {
    console.log(id);
});

/*
    // - The Structure below can be replaced by more efficient router.route('/:id).(get || put || post || delete)

// Get info of user id
router.get('/:id', function(req, res) {
    let id = req.params.id;
    res.send("User Get "+id);
});

// update info of user id
router.put('/:id', function(req, res) {
    let id = req.params.id;
    res.send("User Put "+id);
});

// delete info of user id
router.delete('/:id', function(req, res) {
    let id = req.params.id;
    res.send("User Delete "+id);
});
*/

module.exports = router;