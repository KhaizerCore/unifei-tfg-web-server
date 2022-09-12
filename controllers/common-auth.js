const db = require('../db');
const MAX_LOGIN_SESSION_TIME = 1000 * 60 * 60 * 99999; // 1000ms/s * 60s/min * 60min/h * 2h = 7200000ms = 2h

var getAuthCode = function (){
    let code = '';
    for (let i = 0; i < 6; i ++){
        code += String(Math.floor(Math.random() * 9)); // getRandomIntFrom0To9
    }
    return String(code);
}

// TO BE IMPLEMENTED: MAX USER SESSION TIME --> compare now with timestamp
async function validateUserLoginToken(email, token){
    let Login = db.Login;
    // matches login token
    let validation = await Login.find({
        email : email,
        token : token
    });
    // TO BE IMPLEMENTED: MAX USER SESSION TIME --> compare now with timestamp
    
    if (validation.length > 0){
        let delta = new Date().getTime() - validation[0].timestamp;
        if (delta <= MAX_LOGIN_SESSION_TIME)
            return true;
        else
            return false;
    }
    return false;
}

module.exports = {
    getAuthCode : getAuthCode,
    validateUserLoginToken : validateUserLoginToken
}