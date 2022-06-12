const { v4: uuidv4 } = require('uuid');
const db = require('../../db');
const inputValidation = require('../input-validation');
const responseMessages = require('../res-messages');

// if email, password matches return username, otherwise returns false
async function matchEmailPassword(email, password) {
    let User = db.User;
    let validation = await User.find({
        email : email,
        password : password
    });
    return validation.length > 0 ? validation[0].name : false;
}

async function saveLoginRegister(email, token) {
    let logins = db.Mongoose.model('logincollection', db.LoginSchema, 'logincollection');
    let login = new logins({
        email : email,
        token : token,
        timestamp : new Date().getTime()
    });
    login.save(
        function(error) {
            if (error) {
                console.log("Login Authentication Register Creating Failed!");
            } else {
                console.log("Login Authentication Register Created Successfully!");
            }
        }
    );
}

async function removeAllLoginRegisters(email){
    let Login = db.Login;
    let login = await Login.deleteMany({
        email : email
    }).then(result => {
    });
}

async function requestUserLogin(req, res){
    let email = req.body.email;
    let password = req.body.password;

    if (inputValidation.emailAndPasswordValidation(email, password)){
        try{
            matchEmailPassword(email, password).then( matches => {
                if (matches){
                    removeAllLoginRegisters(email).then(() => {
                        let token = uuidv4();
                        saveLoginRegister(email, token).then(() => {
                            // 202 Login Accepted
                            res.status(202).send({
                                'message' : responseMessages.key('login-success').lang('pt_br'),
                                'username' : matches,
                                'token' : token
                            });
                            console.log(responseMessages.key('login-success').lang('pt_br'));
                        });                  
                    });
                }else{
                    // 401 Login Unauthorized
                    res.status(401).send(
                        responseMessages.key('login-fail').lang('pt_br')
                    );
                }
            });    
        }catch(e){
            // 500 Login Error
            res.status(500).send(
                responseMessages.key('internal-server-error').lang('pt_br')
            );
        }
    }else{
        res.status(500).send(
            responseMessages.key('invalid-email-password').lang('pt_br')
        );
    }
}


module.exports = {
    requestUserLogin : requestUserLogin
};

