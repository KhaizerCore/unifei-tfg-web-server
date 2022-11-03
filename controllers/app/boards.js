const db = require('../../db');
const commonAuth = require('../common-auth');
const mqttController = require('../iot/mqtt-controller');

async function retriveBoardData(req, res){
    try {
        let license_key = req.headers.license_key;
        let board = await db.Board.findOne({
            license_key : license_key
        });
        res.status(200).send(board);
    } catch (error) {
        res.status(500).send();
    }
}

async function licenseInUse(license_key){
    let boards = await db.Board.find({
        license_key: license_key
    });
    return boards.length > 0;
}

async function userHasLicense(email, license_key){
    let userLicenses = await db.User.find({
        email: email,
        license_keys : license_key
    });
    return userLicenses.length > 0;
}

async function requestRegisterBoard(req, res){
    let email = req.headers.email;
    let token = req.headers.token;

    let data = req.body;
    try {
        userHasLicense(email, data.license_key).then(hasLicense => {
            if (hasLicense){
                licenseInUse(data.license_key).then(inUse => {
                    if (!inUse) {
                        let boards = db.Mongoose.model('boardcollection', db.BoardSchema, 'boardcollection');
                        var board = new boards({
                            owner_email : email,
                            license_key : data.license_key,
                            device_nickname : data.device_nickname,
                            device_type : data.device_type,
                            device_setup : data.device_setup
                        });
                        board.save(
                            function(error) {
                                if (error) {
                                    console.log("Board Registration Failed!");
                                    res.status(500).send("Board Registration Failed!");
                                } else {
                                    console.log("Board Registered Successfully!");
                                    res.status(200).send({
                                        'message' : "Board Registered Successfully!"
                                    });
                                }
                            }
                        );
                    }else{
                        console.log("Board Registration Failed!");
                        res.status(403).send("Board Registration Failed!");
                    }
                });
            }else{
                console.log("Board Registration Failed!");
                res.status(500).send("Board Registration Failed!");
            }
        });     
    }catch(err){
        console.log("Board Registration Failed!");
        res.status(500).send("Board Registration Failed!");
    }
}

function filterSetupProperties(setup, propertiesToBeDeleted){
    // Clones setup obj, so we can safely delete properties without messing with outer references to original obj
    setup = JSON.parse(JSON.stringify(setup));
    // Removes key values from setup, that cant be used to match database board setup pattern
    //
    propertiesToBeDeleted.forEach((property, property_index) => {
        setup.forEach((setup_element, setup_element_index) => {
            delete setup[setup_element_index][property];
        });       
    });
    return setup
}


// This version of validateBoardSetup function is deprecated. It is valid for the older
//version of db_updateBoardSetupValues function mentioned in comments.
// async function validateBoardSetup(license_key, setup, propertiesToBeDeleted){
    
//     setup = filterSetupProperties(setup, propertiesToBeDeleted);

//     // for each incoming request setup element, check if it matches to one of the databases device setup elements of referred license_key
//     for (i = 0; i < setup.length; i++){
//         let setup_element = setup[i];
//         let board = await db.Board.find({
//             license_key : license_key,
//             device_setup : { 
//                 $all : [ // put element match conditions to match array values
//                     { $elemMatch : setup_element }
//                 ]
//             }
//         });
//         if (!board.length) return false;
//     }

//     return true;
// }

async function validateBoardSetup(license_key, setup){

    let ObjectId = require('mongodb').ObjectId;      
    // for each incoming request setup element, check if it matches to one of the databases device setup elements of referred license_key
    for (i = 0; i < setup.length; i++){
        let setup_element = setup[i];
        let board = await db.Board.find({
            "license_key" : license_key,
            "device_setup._id" : new ObjectId(setup_element._id)
        });
        if (!board.length) return false;
    }

    return true;
}


/*
    In order to update board setup parameters throught web client,

*/

// This version of db_updateBoardSetupValues perform update on device setup elements
//based on its main key components values, so thats not the best way.
// The new implementation use the ObjectID of device setup element, after new scheme
//was set on db.js. Now mongo can automatically create id for theses guys and we can
//update their values using id as filter.
// async function db_updateBoardSetupValues(license_key, setup, keysToUpdate) {

//     for (let i = 0; i < setup.length; i++){
//         let setup_element = setup[i];
//         let arrayFilter = null;

//         switch (setup_element.TYPE){
//             case "OUTPUT":
//                 arrayFilter = {
//                     "arrayFilters" : [{ 
//                         "element.TYPE" : setup_element.TYPE,    // OUTPUT or INPUT or VARIABLE...
//                         "element.VALUE_TYPE" : setup_element.VALUE_TYPE, // setup element value type
//                         "element.PIN" : setup_element.PIN                        
//                     }]
//                 };                
//             break;

//             case "INPUT":
//                 arrayFilter = {
//                     "arrayFilters" : [{ 
//                         "element.TYPE" : setup_element.TYPE, // OUTPUT or INPUT or VARIABLE...
//                         "element.VALUE_TYPE" : setup_element.VALUE_TYPE, // setup element value type
//                         "element.PIN" : setup_element.PIN                        
//                     }]
//                 };   
//             break;

//             case "VARIABLE":
//                 arrayFilter = {
//                     "arrayFilters" : [{ 
//                         "element.TYPE" : setup_element.TYPE, // OUTPUT or INPUT or VARIABLE...
//                         "element.VALUE_TYPE" : setup_element.VALUE_TYPE, // setup element value type
//                         "element.VARIABLE_NAME" : setup_element.VARIABLE_NAME
//                     }]
//                 };   
//             break;

//             default:
//                 console.log("Unsupported setup element TYPE");
//                 return false;
//             break;
//         }


//         let setObj = { // set model for mongodb update operation
//             "$set" : {} // blank set object
//         }; 

//         keysToUpdate.forEach(key => { // fill setObj with keys that will be updated on mongo query
//             let setKeyStr = "device_setup.$[element]." + key;
//             setObj["$set"][setKeyStr] = setup_element[key];
//         })     

//         // update operation
//         let result = await db.Board.collection.updateOne(
//             {
//                 "license_key" : license_key
//             }, setObj, arrayFilter
//         );
        
//         console.log('result:', result);
//     }    
// }

// The new implementation use the ObjectID of device setup element, after new scheme
//was set on db.js. Now mongo can automatically create id for theses guys and we can
//update their values using id as filter.
// pass 
async function db_updateBoardSetupValues(license_key, setup) {
    const notToBeUpdatedTokens = ['_id', 'TOPIC_ID'];
    
    for (let i = 0; i < setup.length; i++){
        let setup_element = setup[i];
        let arrayFilter = {};
        
        let setObj = { // set model for mongodb update operation
            "$set" : {} // blank set object
        }; 

        Object.keys(setup_element).forEach(key => { // fill setObj with keys that will be updated on mongo query
            if (!notToBeUpdatedTokens.includes(key)){
                let setKeyStr = "device_setup.$." + key;
                setObj["$set"][setKeyStr] = setup_element[key];
            }            
        })     

        let ObjectId = require('mongodb').ObjectId;      
        
        let result = await db.Board.collection.updateOne(
            {
                "license_key" : license_key,
                "device_setup._id" : new ObjectId(setup_element._id)
            }, setObj, arrayFilter
        );
        console.log('update result:', result);
    }    
}

// EM DESENVOLVIMENTO...
async function requestBoardControl(req, res) {

    let controlParams = req.body;
    // console.log('Control Params:', controlParams);

    const license_key = controlParams.license_key;
    const setup = controlParams.setup;
    
                
    validateBoardSetup(license_key, setup).then(boardSetupValidated => {
        if (boardSetupValidated){
            
            db_updateBoardSetupValues(license_key, setup).then(resolved => {
                mqttController.sendBoardValue(license_key, setup).then(mqttResolved => {
                    res.status(200).send({
                        'message': 'Board control sent successfully'
                    });
                });
            });

        }else{
            res.status(500).send('Invalid Board Setup');
        }
    });        

}

module.exports = {
    retriveBoardData : retriveBoardData,
    requestBoardControl : requestBoardControl,
    requestRegisterBoard : requestRegisterBoard
};