const express = require('express');
const router = express.Router();
const db = require('../../db');

const authRouter = require('./auth');
router.use('/auth', authRouter);

async function retriveUser(req, res, User){
    let user = await User.find();
    console.log(user);
    res.send(user);
}

// parameters( path, function(request, response, nextFunction))
router.get('/', function(req, res) {
    retriveUser(req, res, db.User);
});

router.post('/create', function(req, res) {

    let data = req.body;
    let users = db.Mongoose.model('usercollection', db.UserSchema, 'usercollection');
    var user = new users({
        name : data.name,
        email : data.email,
        cellphone : data.cellphone,
        password : data. password
    });
    user.save(
        function(error) {
            if (error) {
                console.log("deu ruim 1");
            } else {
                console.log("deu baum 1");
            }
        }
    );

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