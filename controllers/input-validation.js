var emailValidator = require('email-validator');
var PasswordValidator = require('password-validator');

// * PASSWORD VALIDATOR *
passwordValidator = new PasswordValidator();
// Minimun of 8 characters
passwordValidator.is().min(8);
// Maximum of 8 characters
passwordValidator.is().max(32);
// No spacebar allowed
passwordValidator.has().not().spaces();

var emailAndPasswordValidation = function (email, password) {
    return (emailValidator.validate(email) && passwordValidator.validate(password));
}

var validate6NumberAuthCode = function (code) {
    code = String(code);
    return (code.length === 6) && (code.match(/^ *$/) === null)
}

module.exports = {
    emailValidator: emailValidator,
    passwordValidator: passwordValidator,
    emailAndPasswordValidation : emailAndPasswordValidation,
    validate6NumberAuthCode : validate6NumberAuthCode
}