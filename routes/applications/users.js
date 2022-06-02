const express = require('express');
const router = express.Router();
const db = require('../../db');
const nodemailer = require('nodemailer');
const inputValidation = require('./input-validation');

const auth = require('./auth');
router.use('/auth', auth.router);

async function userExists(email){
    let User = db.User;
    let user = await User.find({
        email : email
    });
    return user.length > 0;
}

async function macthEmailPasswordResetCode(email, code){
    let PasswordReset = db.PasswordReset;
    let passwordReset = await PasswordReset.find({
        email : email,
        code : code
    });
    if (passwordReset.length > 0){ // exists
        //checks for timestamp delta
        let now = new Date().getTime();
        if (now - passwordReset[0].timestamp <= 60*5*1000){   // 60 * 5 * 1000ms = 5 min
            return true; // totally validated!
        }
    }
    return false;
}

async function createUser(req, res, data){
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
                console.log("User Creation Failed!");
                res.status(500).send("User Creation Failed!");
            } else {
                console.log("User Created Successfully!");
                res.status(200).send("User Created Successfully!");
            }
        }
    );
}

async function deletePasswordResetRegister(email, code){
    let PasswordReset = db.PasswordReset;
    await PasswordReset.findOneAndDelete({
        email : email, 
        code : code
    }).then(result => {
        //console.log("deleted:",result);
    });
}

async function changePassword(req, res, email, code, newPassword){
    if (inputValidation.emailAndPasswordValidation(email, newPassword)){
        if (inputValidation.validate6NumberAuthCode(code)){
            macthEmailPasswordResetCode(email, code).then( matches => {
                deletePasswordResetRegister(email, code);
                if (matches){
                    try {
                        let User = db.User;
                        User.findOneAndUpdate({
                            email : email
                        },{
                            password : newPassword
                        },{
                            upsert : false,
                            new : true
                        }).then(result => {
                            //console.log("updated:",result);
                        });                
                        res.status(200).send('Validated!');
                    } catch (error) {
                        res.status(500).send('Internal Server Error');
                    }            
                }else{
                    res.status(401).send('Invalid Code!');
                }        
            });
        }else{
            res.status(401).send('Invalid Code!');
        }
    }else{
        res.status(500).send('Invalid User and/or Password!');
    }
}

router.post('/create', function(req, res) {
    let data = req.body;

    let email = data.email
    let password = data.password;

    if (inputValidation.emailAndPasswordValidation(email, password)){
        userExists(email).then( exists => {
            if (exists){
                res.status(400).send('Email already in use!');
            }else{
                createUser(req, res, data);
            }
        });
    }else{
        res.status(500).send('Invalid User and/or Password!');
    }
    
});


router.post('/forgotPass', function(req, res) {

    let data = req.body;    
    let emailTo = data.email;
    
    if (inputValidation.emailValidator.validate(emailTo)){
        // CHECK IF EMAIL EXISTS IN database before sending email !!!
        userExists(emailTo).then( exists => {
            if (exists){
                sendPasswordResetEmail(req, res, emailTo);
            }else{
                res.status(400).send('Email not in use by any account!');
            }
        });
    }else{
        res.status(500).send('Invalid e-mail!');
    }   
    
});

router.put('/changePass', function(req, res) {
    let data = req.body;
    changePassword(req, res, data.email, data.code, data.new_password);
});

async function savePasswordResetRegister(emailTo, code){
    let passwordResets = db.Mongoose.model('password_reset_collection', db.PasswordResetSchema, 'password_reset_collection');
    let passwordReset = new passwordResets({
        email : emailTo,
        code : code,
        timestamp : new Date().getTime()
    });
    await passwordReset.save(
        function(error) {
            if (error) {
                console.log("Password Reset Register Creating Failed!");
            } else {
                console.log("Password Reset Register Created Successfully!");
            }
        }
    );
}

async function sendPasswordResetEmail(req, res, emailTo){
    let code = auth.getAuthCode();
    let subject = 'Password Change Request - SIGIOT';
    let content = 'Use this code to reset your password: ' + code;

    savePasswordResetRegister(emailTo, code).then(result => {
        sendEmail(req, res, emailTo, subject, content);
    });    
}

function sendEmail(req, res, emailTo, subject, content){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sigiotsystem@gmail.com',
          pass: '~%mqcw?Dht54Dt53'
        }
    });
      
    let mailOptions = {
        from: 'sigiotsystem@gmail.com',
        to: emailTo,
        subject: subject,
        text: content
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.status(500).send(String(subject) + " Email Not Sent");
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send(String(subject) + " Email Sent Successfully!");
        }
    });
}

/*
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