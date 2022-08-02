// controller.js
const { ObjectId } = require('mongodb');
const mqtt = require('mqtt');
const db = require('../../db');

const client = mqtt.connect('da4cea57792c41b6be6304e4ece822b0.s1.eu.hivemq.cloud', {
    rejectUnauthorized: false,
    protocol: 'MQTTS'
});
/*
const client = mqtt.connect('broker.hivemq.com', {
  //rejectUnauthorized: false,
  protocol: 'MQTT'
});
*/


client.on('connect', () => {
  client.subscribe('board/connected');
});

client.on('message', (topic, message) => {
  processTopicMessage(topic, message);  
});

function processTopicMessage(topic, message) {
  message = JSON.parse(message);
  console.log("message received for topic:", topic);

  switch (topic) {
    case 'board/connected':
      return handleBoardConnected(message);
  }

  // 'board/license_key/setup/topicID' 
  if (validBoardSetupTopicReturnTopicBoardID(topic)) {
    if (validBoardSetupTopicReturnTopicBoardID(topic).license_key == message.license_key)
      return handleBoardSetupValue(message);
  }

  // 'board/boardID/Warning'

  // 'board/boardID/Info'

  console.log('No handler for topic %s', topic);
}

function getValueAfterMQTTToken(topic, token){
  // For example, you send this topic --> 'board/boardID/setup/setup_element_topic_id' 
  // And you send token = board. It will return boardID
  const delimiter = '/';
  let p = topic.substring(topic.lastIndexOf(token) + String(token + delimiter).length); // removes everything left of desired parameter
  p = p.substring(0, p.indexOf(delimiter) == -1 ? p.length : p.indexOf(delimiter)); // removes everything right from desired parameter
  return p;
}

function validBoardSetupTopicReturnTopicBoardID(topic) {
  // matches board Setup Topic default syntax --> 'board/boardID/setup/setup_element_topic_id' 
  return (topic.includes('board/') &&  topic.includes('/setup/')) ? 
    {
      license_key : getValueAfterMQTTToken(topic, 'board'),
      setup_element_topic_id : getValueAfterMQTTToken(topic, 'setup')
    }
    : false;
}


// It updates all device_setup. So, always keeping up with board setup.
// If you add or remove something on board JSON config, it will reflect  
//on middleware DB once MQTT update arrives on mqtt-controller.
async function db_saveDeviceSetup(boardData) {

  // we will filter by license_key
  let license_key = boardData.license_key;

  // Add _id for each device setup element
  boardData.device_setup.forEach((element, index) => {
    boardData.device_setup[index]['_id'] = ObjectId();
  });

  // Remove all device setup elements from device setup array
  await db.Board.collection.updateOne(
    {
      license_key : license_key
    },{
      "$set" : { "device_setup" : [] }
    }
  );


  let result = await db.Board.collection.updateOne(
      {
          license_key : license_key
      },{
          "$push" : {
              "device_setup" : { "$each" : boardData.device_setup }
          }
      }
  );

  //console.log('push update result:',result);
}

async function handleBoardSetupValue(message) {
  console.log('handleBoardSetupValue message:', message);

  const license_key = message.license_key;
  const device_setup = message.device_setup;

  let result = await db.Board.collection.updateOne(
    {
      "license_key" : license_key,
      "device_setup.TOPIC_ID" : device_setup.TOPIC_ID
    },{
      "$set" : {
        "device_setup.$.VALUE" : device_setup.VALUE 
      }
    }
  );

  //console.log('handleBoardSetupValue update result:', result);

  return;
}

function subscribeToBoardSetup(boardData) {

  let license_key = boardData.license_key;

  // board general setup topic syntax structure
  // |--> board/license_key/setup
  let topic = 'board/' + license_key + '/setup';
  client.subscribe(topic);

  let setup = boardData.device_setup;

  for (let i = 0; i < setup.length; i++) {
    let setup_element = setup[i];

    // for each board setup element topic syntax structure
    // |--> board/license_key/setup/setup_element_topic_id
    let topic = 'board/' + license_key + '/setup/' + setup_element.TOPIC_ID;
    
    client.subscribe(topic);

    console.log('subscribed to topic', topic);
  }  
}

function handleBoardConnected (message) {
  let boardData = message;

  console.log('board connected', boardData);

  db_saveDeviceSetup(boardData);

  subscribeToBoardSetup(boardData);
  
}

/* 
--- Server side publications rules (control board outputs) ---
  - For every device setup element from board, there will be a topic. Thus, it's expected 
  that the board will subscribe to it's own IO elements on initial setup.
    - Topic syntax : server/boardID/IO
    - Topic payload : [
      {
        "TYPE" : String,
        "VARIABLE_NAME" : String,
        "NAME" : String,
        "PIN" : Int,
        "CODE" : String,
        "VALUE": typeof(value) value,
        "VALUE_TYPE" : String
        _id : String
      }
    ]
    
*/

async function sendBoardValue(license_key, setup) {
  const board = await db.Board.findOne({
    "license_key" : license_key
  });
  const db_device_setup = board['device_setup'];
 
  setup.forEach((setup_element) => {
    let topic_id = null;
    
    db_device_setup.forEach((db_setup) => {
      if (db_setup['_id'] == setup_element['_id']){

        topic_id = db_setup['TOPIC_ID'];
        const topic = 'server/' + license_key + '/setup/' + topic_id;    
        
        const notToBeUpdatedTokens = ['_id', 'TOPIC_ID'];
        notToBeUpdatedTokens.forEach((key) => {
          delete setup_element[key];
        });
        
        
        client.publish(topic, JSON.stringify(setup_element));
        console.log('topic published:',topic);
      }
    });    
  });

}

function setled (state) {
  client.publish('actuators/led/state', state);
}

function setRelay (state) {
  client.publish('actuators/relay/state', state);
}


// --- For Demo Purposes Only ----//
//toggleActuators();
function toggleActuators(){
  // toggle 
  setTimeout(() => {
    console.log('toggle cycle');
    console.log('toggle half period 1');
    setRelay('true');
    setled('false');

    setTimeout(() => {
      console.log('toggle half period 2');
      setRelay('false');
      setled('true');
      toggleActuators();
    }, 2000);
  }, 2000);
}

module.exports = {
  client : client,
  sendBoardValue : sendBoardValue
};