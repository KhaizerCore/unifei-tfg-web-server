var getKeyValueObject = function(key, value){
    return { [key] : value };
}

// One Message for each language
class ResponseMessage{
    constructor(message, mensagem){
        this.message = {};
        if (message) this.insertMessage('eng', message);
        if (mensagem) this.insertMessage('pt_br', mensagem);
    }

    insertMessage(language, message){
        Object.assign(this.message, getKeyValueObject(language, message));
    }

    lang(language){
        return this.message[language];
    }
}

class ResponseMessages{
    constructor(){
        this.messages = {};
    }

    insertMessage(key, message, mensagem){
        Object.assign(this.messages, getKeyValueObject(key, new ResponseMessage(message, mensagem)));
    }

    key(messageKey){
        return this.messages[messageKey];
    }
}

let responseMessages = new ResponseMessages();

responseMessages.insertMessage('login-fail', 'Login Refused', 'Entrada rejeitada');  
responseMessages.insertMessage('login-success', 'Login Successfull', 'Entrada com sucesso');  
responseMessages.insertMessage('user-creation-fail', 'User Creation Failed', 'Criação de usuário falhou');  
responseMessages.insertMessage('user-creation-success', 'User Created Successfully', 'Usuário criado com sucesso');  
responseMessages.insertMessage('authentication-fail', 'Authentication Failed', 'Autenticação falhou');  
responseMessages.insertMessage('authentication-success', 'Authentication Success', 'Autenticação bem sucedida');  
responseMessages.insertMessage('validation-fail', 'Validation Failed', 'Validação falhou'); 
responseMessages.insertMessage('validation-success', 'Validation Success', 'Validação bem sucedida'); 
responseMessages.insertMessage('internal-server-error', 'Internal Server Error', 'Erro interno do servidor');  
responseMessages.insertMessage('invalid-code', 'Invalid Code', 'Código inválido');  
responseMessages.insertMessage('valid-code', 'Valid Code', 'Código válido');  
responseMessages.insertMessage('invalid-email-password', 'Invalid E-mail and/or Password', 'E-mail e/ou senhas inválidos');  
responseMessages.insertMessage('valid-email-password', 'E-mail and Password Validation Success', 'Validação de e-mail e senha bem sucedida');  
responseMessages.insertMessage('email-in-use', 'E-mail already in use', 'E-mail já está em uso');  
responseMessages.insertMessage('invalid-email', 'Invalid e-mail', 'E-mail inválido');  
responseMessages.insertMessage('pass-reset-fail', 'Password Reset Failed', 'Redefinição de senha falhou');  
responseMessages.insertMessage('pass-reset-success', 'Password Reset Success', 'Senha redefinida com sucesso');  
responseMessages.insertMessage('pass-change-subject-info', 'Password Change Request', 'Requisicao de redefinição de senha');  
responseMessages.insertMessage('pass-change-content-info', 'Use this code to reset your password', 'Utilize este código para redefinir a sua senha');  
responseMessages.insertMessage('email-sent', 'E-mail Not Sent', 'E-mail não foi enviado');
responseMessages.insertMessage('email-not-sent', 'E-mail Sent Successfully', 'E-mail enviado com sucesso');

module.exports = responseMessages;
