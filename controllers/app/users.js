const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const db = require('../../db');
const inputValidation = require('../input-validation');
const responseMessages = require('../res-messages');
const commonAuth = require('../common-auth');

async function userExists(email) {
    let User = db.User;
    let user = await User.find({
        email: email
    });
    return user.length > 0;
}

async function macthEmailPasswordResetCode(email, code) {
    let PasswordReset = db.PasswordReset;
    let passwordReset = await PasswordReset.find({
        email: email,
        code: code
    });
    if (passwordReset.length > 0) { // exists
        //checks for timestamp delta
        let now = new Date().getTime();
        if (now - passwordReset[0].timestamp <= 60 * 5 * 1000) {   // 60 * 5 * 1000ms = 5 min
            return true; // totally validated!
        }
    }
    return false;
}

async function createUser(req, res, data) {
    let users = db.Mongoose.model('usercollection', db.UserSchema, 'usercollection');
    var user = new users({
        name: data.name,
        email: data.email,
        cellphone: data.cellphone,
        password: data.password,
        license_keys: []
    });
    user.save(
        function (error) {
            if (error) {
                console.log("User Creation Failed!");
                res.status(500).send(
                    responseMessages.key('user-creation-fail').lang('pt_br')
                );
            } else {
                console.log("User Created Successfully!");
                res.status(200).send({
                    'message': responseMessages.key('user-creation-success').lang('pt_br')
                });
            }
        }
    );
}

async function deletePasswordResetRegister(email, code) {
    let PasswordReset = db.PasswordReset;
    await PasswordReset.findOneAndDelete({
        email: email,
        code: code
    }).then(result => {
        //console.log("deleted:",result);
    });
}

async function getUser(email) {
    let User = db.User;
    let user = await User.findOne({
        email: email
    });
    return user;
}

async function getUserBoards(email) {
    let boards = await db.Board.find({
        owner_email: email
    });
    // console.log('getUserBoards', boards);
    return boards;
}

async function getUserSpecificBoard(email, license_key) {
    let board = await db.Board.findOne({
        owner_email: email,
        license_key: license_key
    });
    //console.log('getUserSpecificBoard', board);
    return board;
}

async function savePasswordResetRegister(emailTo, code) {
    let passwordResets = db.Mongoose.model('password_reset_collection', db.PasswordResetSchema, 'password_reset_collection');
    let passwordReset = new passwordResets({
        email: emailTo,
        code: code,
        timestamp: new Date().getTime()
    });
    await passwordReset.save(
        function (error) {
            if (error) {
                console.log("Password Reset Register Creating Failed!");
            } else {
                console.log("Password Reset Register Created Successfully!");
            }
        }
    );
}

async function sendPasswordResetEmail(req, res, emailTo) {
    let code = commonAuth.getAuthCode();
    let subject = responseMessages.key('pass-change-subject-info').lang('pt_br') + ' - SIGIOT';
    let content = responseMessages.key('pass-change-content-info').lang('pt_br') + ': ' + code;

    savePasswordResetRegister(emailTo, code).then(result => {
        sendEmail(req, res, emailTo, subject, content);
    });
}

function sendEmail(req, res, emailTo, subject, content) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sigiotsystem@gmail.com',
            pass: 'nrnveiflpwyfljur'
        }
    });

    let mailOptions = {
        from: 'sigiotsystem@gmail.com',
        to: emailTo,
        subject: subject,
        text: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500).send(String(subject) + " " + responseMessages.key('email-not-sent').lang('pt_br'));
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send({
                'message' : String(subject) + " " + responseMessages.key('email-sent').lang('pt_br')
            });
        }
    });
}

// Function to be further developed. For now, user can have no license limit
function userHasAchievedBoardLicenseLimit(email) {
    // Function to be further developed. For now, user can have no license limit
    return false;
}

async function createBoardLicense(email) {
    let license_key = uuidv4();

    try {
        await db.User.updateOne(
            { email: email },
            { $push: { license_keys: license_key } }
        );
        console.log('Board License Successfully created');
    } catch (error) {
        console.log('Board License creation failed');
    }
}

async function requestChangePassword(req, res) {
    let data = req.body;
    let email = data.email;
    let code = data.code;
    let newPassword = data.new_password
    if (inputValidation.emailAndPasswordValidation(email, newPassword)) {
        if (inputValidation.validate6NumberAuthCode(code)) {
            macthEmailPasswordResetCode(email, code).then(matches => {
                deletePasswordResetRegister(email, code);
                if (matches) {
                    try {
                        let User = db.User;
                        User.findOneAndUpdate({
                            email: email
                        }, {
                            password: newPassword
                        }, {
                            upsert: false,
                            new: true
                        }).then(result => {
                            //console.log("updated:",result);
                        });
                        res.status(200).send({
                            'message' : responseMessages.key('pass-reset-success').lang('pt_br')
                        });
                    } catch (error) {
                        res.status(500).send(
                            responseMessages.key('pass-reset-fail').lang('pt_br')
                        );
                    }
                } else {
                    res.status(401).send(
                        responseMessages.key('invalid-code').lang('pt_br')
                    );
                }
            });
        } else {
            res.status(401).send(
                responseMessages.key('invalid-code').lang('pt_br')
            );
        }
    } else {
        res.status(500).send(
            responseMessages.key('invalid-email-password').lang('pt_br')
        );
    }
}

async function requestCreateUser(req, res) {
    let data = req.body;

    let email = data.email
    let password = data.password;

    if (inputValidation.emailAndPasswordValidation(email, password)) {
        userExists(email).then(exists => {
            if (exists) {
                res.status(400).send(
                    responseMessages.key('email-in-use').lang('pt_br')
                );
            } else {
                createUser(req, res, data);
            }
        });
    } else {
        res.status(500).send(
            responseMessages.key('invalid-email-password').lang('pt_br')
        );
    }
}

async function requestForgotPassword(req, res) {
    let data = req.body;
    let emailTo = data.email;

    if (inputValidation.emailValidator.validate(emailTo)) {
        // CHECK IF EMAIL EXISTS IN database before sending email !!!
        userExists(emailTo).then(exists => {
            if (exists) {
                sendPasswordResetEmail(req, res, emailTo);
            } else {
                res.status(400).send(
                    responseMessages.key('invalid-email').lang('pt_br')
                );
            }
        });
    } else {
        res.status(500).send(
            responseMessages.key('invalid-email').lang('pt_br')
        );
    }
}

async function areLicensesInUse(licenses) {
    let licensesWithUsageStatistic = [];
    for (let i = 0; i < licenses.length; i++) {
        let license = licenses[i];
        board = await db.Board.find({
            license_key: license
        });
        licensesWithUsageStatistic.push(
            {
                "license_key": license,
                "in_use": board.length > 0 ? true : false
            }
        );
    }
    return licensesWithUsageStatistic;
}

async function requestUserBoardLicenses(req, res) {
    let email = req.headers.email;
    let token = req.headers.token;

    commonAuth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            getUser(email).then(user => {
                areLicensesInUse(user.license_keys).then(licensesWithUsageStatistic => {
                    res.status(200).send(licensesWithUsageStatistic);
                });
            });
        } else {
            // 401 Unauthorized
            res.status(401).send('Autenticacao mal sucedida!');
        }
    });
}

async function requestUserBoards(req, res) {
    let email = req.headers.email;
    let token = req.headers.token;

    commonAuth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            getUserBoards(email).then(boards => {
                res.status(200).send({
                    boards: boards
                });
            });
        } else {
            // 401 Unauthorized
            res.status(401).send('Autenticacao mal sucedida!');
        }
    });
}

async function requestUserSpecificBoard(req, res) {
    let email = req.headers.email;
    let token = req.headers.token;
    let license_key = req.headers.license_key;

    commonAuth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            getUserSpecificBoard(email, license_key).then(board => {
                res.status(200).send({
                    board: board
                });
            });
        } else {
            // 401 Unauthorized
            res.status(401).send('Autenticacao mal sucedida!');
        }
    });
}

async function requestBoardLicenseCreation(req, res) {
    // passar email e token de usuario
    let email = req.headers.email;
    let token = req.headers.token;

    // VALIDATE WITH EMAIL AND TOKEN, and timestamp delta max session time
    commonAuth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            if (!userHasAchievedBoardLicenseLimit()) {
                createBoardLicense(email);
                res.status(200).send({
                    'message': 'license request probably well done'
                });
            }
        } else {
            res.status(401).send('Autenticacao mal sucedida!');
        }
    });
}

async function updateBoardNicknname(email, license_key, device_nickname) {
    const updateResult = await db.Board.collection.updateOne(
        {
            "owner_email": email,
            "license_key": license_key
        }, {
        "$set": {
            "device_nickname": device_nickname
        }
    }
    );
    return updateResult;
}

async function requestChangeBoardNickname(req, res) {
    // passar email e token de usuario
    const email = req.headers.email;
    const token = req.headers.token;

    // VALIDATE WITH EMAIL AND TOKEN, and timestamp delta max session time
    commonAuth.validateUserLoginToken(email, token).then(validated => {
        if (validated) {
            const license_key = req.body.license_key;
            const device_nickname = req.body.device_nickname;

            updateBoardNicknname(email, license_key, device_nickname).then(updateResult => {
                console.log("updateBoardNicknname result:", updateResult);
                res.status(200).send({
                    'message' : 'ChangeBoardNickname request probably well done'
                });
            })

        } else {
            res.status(401).send('ChangeBoardNickname request Failed');
        }
    });
}

module.exports = {
    requestCreateUser: requestCreateUser,
    requestForgotPassword: requestForgotPassword,
    requestChangePassword: requestChangePassword,
    requestBoardLicenseCreation: requestBoardLicenseCreation,
    requestUserBoardLicenses: requestUserBoardLicenses,
    requestUserBoards: requestUserBoards,
    requestUserSpecificBoard: requestUserSpecificBoard,
    requestChangeBoardNickname: requestChangeBoardNickname
}