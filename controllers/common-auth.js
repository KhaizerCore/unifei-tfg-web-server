const db = require('../db');

function getRandomIntFrom0To9() {
    return Math.floor(Math.random() * 9);
}

var getAuthCode = function (){
    let code = '';
    for (let i = 0; i < 6; i ++){
        code += String(getRandomIntFrom0To9());
    }
    return String(code)
}

async function validateUserLoginToken(email, token){
    let Login = db.Login;
    // matches login token
    let validation = await Login.find({
        email : email,
        token : token
    });
    // TO BE IMPLEMENTED: MAX USER SESSION TIME --> compare now with timestamp
    /*
    if (validation.length > 0){
        let delta = new Date().getTime() - validation[0].timestamp;
        if (delta <= MAX_LOGIN_SESSION_TIME){
            return true;
        }
        else{
            return false;
        }
    }
    */
    return validation.length > 0;   
}

module.exports = {
    getAuthCode : getAuthCode,
    validateUserLoginToken : validateUserLoginToken
}