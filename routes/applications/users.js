const express = require('express');
const router = express.Router();
const db = require('../../db');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const inputValidation = require('./input-validation');
const responseMessages = require('./res-messages');
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
        password : data. password,
        license_keys : []
    });
    user.save(
        function(error) {
            if (error) {
                console.log("User Creation Failed!");
                res.status(500).send(
                    responseMessages.key('user-creation-fail').lang('pt_br')
                );
            } else {
                console.log("User Created Successfully!");
                res.status(200).send({
                    'message' : responseMessages.key('user-creation-success').lang('pt_br')
                });
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

async function changePassword(req, res){
    let data = req.body;
    let email = data.email; 
    let code = data.code;
    let newPassword = data.new_password
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
                        res.status(200).send(
                            responseMessages.key('pass-reset-success').lang('pt_br')
                        );
                    } catch (error) {
                        res.status(500).send(
                            responseMessages.key('pass-reset-fail').lang('pt_br')
                        );
                    }            
                }else{
                    res.status(401).send(
                        responseMessages.key('invalid-code').lang('pt_br')
                    );
                }        
            });
        }else{
            res.status(401).send(
                responseMessages.key('invalid-code').lang('pt_br')
            );
        }
    }else{
        res.status(500).send(
            responseMessages.key('invalid-email-password').lang('pt_br')
        );
    }
}

router.post('/create', function(req, res) {
    let data = req.body;

    let email = data.email
    let password = data.password;

    if (inputValidation.emailAndPasswordValidation(email, password)){
        userExists(email).then( exists => {
            if (exists){
                res.status(400).send(
                    responseMessages.key('email-in-use').lang('pt_br')
                );
            }else{
                createUser(req, res, data);
            }
        });
    }else{
        res.status(500).send(
            responseMessages.key('invalid-email-password').lang('pt_br')
        );
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
                res.status(400).send(
                    responseMessages.key('invalid-email').lang('pt_br')
                );
            }
        });
    }else{
        res.status(500).send(
            responseMessages.key('invalid-email').lang('pt_br')
        );
    }   
    
});

async function getUser(email){
    let User = db.User;
    let user = await User.findOne({
        email : email
    });
    return user;
}

async function getUserBoards(email) {
    let boards = await db.Board.find({
        owner_email : email
    });
    console.log('getUserBoards', boards);
    return boards;
}


async function requestUserBoardLicenses(req, res){
    let email = req.headers.email;
    let token = req.headers.token;

    auth.validateUserLoginToken(email, token).then(validated => { 
        if (validated){
            getUser(email).then(user => {
                res.status(200).send({
                    license_keys : user.license_keys
                });
            });            
        }else{
            // 401 Unauthorized
            res.status(401).send({
                // INSERIR MENSAGEM DE RESPOSTA
            });
        }
    });
}

async function requestUserBoards(req, res){
    let email = req.headers.email;
    let token = req.headers.token;

    auth.validateUserLoginToken(email, token).then(validated => { 
        if (validated) {
            getUserBoards(email).then(boards => {
                res.status(200).send({
                    boards : boards
                });
            });          
        }else{
            // 401 Unauthorized
            res.status(401).send({
                // INSERIR MENSAGEM DE RESPOSTA
            });
        }
    });
}

router.put('/changePass', function(req, res) {
    changePassword(req, res);
});

router.post('/createLicense', function(req, res) {
    requestBoardLicenseCreation(req, res);
});

router.get('/boardLicenses', function(req, res) {
    requestUserBoardLicenses(req, res);
});

router.get('/boards', function(req, res) {
    requestUserBoards(req, res);
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
    let subject = responseMessages.key('pass-change-subject-info').lang('pt_br') + ' - SIGIOT';
    let content = responseMessages.key('pass-change-content-info').lang('pt_br') + ': ' + code;

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
            res.status(500).send(String(subject) + " " + responseMessages.key('email-not-sent').lang('pt_br'));
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send(String(subject) + " " + responseMessages.key('email-sent').lang('pt_br'));
        }
    });
}

function userHasAchievedBoardLicenseLimit(email){
    // Function to be further developed. For now, user can have no license limit
    return false;
}

function generateBoardLicense(){
    return uuidv4();
}

async function createBoardLicense(email){
    let license_key = generateBoardLicense();

    try {
        await db.User.updateOne(
            {email : email},
            { $push : { license_keys : license_key }}
        );
        console.log('Board License Successfully created');
    } catch (error) {
        console.log('Board License creation failed');
    }   
}

async function requestBoardLicenseCreation(req, res){
    // passar email e token de usuario
    let email = req.headers.email;
    let token = req.headers.token;

    // VALIDATE WITH EMAIL AND TOKEN, and timestamp delta max session time
    auth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            if (!userHasAchievedBoardLicenseLimit()){
                createBoardLicense(email)
                res.status(200).send('license request probably well done');
            }
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