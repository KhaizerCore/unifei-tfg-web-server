// controller.js
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
  
  switch (topic) {
    case 'board/connected':
      return handleBoardConnected(message);
  }

  // 'board/boardID/IO' 
  if (validBoardIOTopicReturnTopicBoardID(topic)) {
    if (validBoardIOTopicReturnTopicBoardID(topic) == message.board_id)
      return handleBoardIOValues(message);
  }

  // 'board/boardID/Warning'

  // 'board/boardID/Info'

  console.log('No handler for topic %s', topic);
}

function validBoardIOTopicReturnTopicBoardID(topic) {
  // matches board IO Topic default syntax --> 'board/boardID/IO' 
  return (topic.includes('board/') &&  topic.includes('/IO')) ? 
    topic.substring(
      topic.lastIndexOf('board/') + String('board/').length,
      topic.lastIndexOf('/IO')
    ) 
    : false;
}

async function handleBoardIOValues(message) {
  console.log('message:', message);
  try {
    await db.Board.findOneAndUpdate(
      {
        license_key : message.board_id 
      },
      {
        device_setup : message.device_setup
      }
    );
    console.log('handleBoardIOValues db.Board.findOneAndUpdate successfull');
  } catch (error) {
    console.log('handleBoardIOValues error', error);
  }
  
}

function subscribeToBoardIO(boardID) {
  // board IO topic syntax structure
  // |--> board/boardID/IO
  let topic = 'board/' + boardID + '/IO';
  client.subscribe(topic);
  console.log('subscribed to topic', topic);
}

function handleBoardConnected (message) {
  let boardData = message;
  /*
    {
      board_id : boardID,
      "device_setup" : [
        {
            "IO_TYPE" : "OUTPUT",
            "PIN" : 2,
            "CODE" : "LED",
            "NAME" : "Luz da lampada",
            "VALUE" : true,
            "VALUE_TYPE" : "BOOL" 
        },
        {
            "IO_TYPE" : "INPUT",
            "PIN" : 3,
            "CODE" : "DHT-22",
            "NAME" : "Sensor de Temperatura da lampada",
            "VALUE" : 27,
            "VALUE_TYPE" : "INT" 
        },
        {
            "IO_TYPE" : "OUTPUT",
            "PIN" : 4,
            "CODE" : "GENERIC-LED",
            "NAME" : "Buzzer de emergência",
            "VALUE": true,
            "VALUE_TYPE" : "BOOL" 
        }
    ]
    }
  */
  console.log('board connected', boardData);

  subscribeToBoardIO(boardData.license_key);
  
}

/* 
--- Server side publications rules (control board outputs) ---
  - For every IO element from board, there will be a topic. Thus, it's expected 
  that the board will subscribe to it's own IO elements on initial setup.
    - Topic syntax : server/boardID/IO
    - Topic payload : {
      "IO_TYPE" : String,
      "PIN" : Int,
      "CODE" : String,
      "NAME" : String,
      "VALUE": typeof(value) value,
      "VALUE_TYPE" : String
    }
*/

// class BoardIOPayload{
//   constructor(){
//     this.io_type = 
//     this.pin = 
//     this.code = {};
//     this.name = 
//     this.value = 
//     this.value_type = typeof(value);
//   }

//   getPayload = function(){

//   }
// }

async function sendBoardValue(license_key, topicPayload) {
  let topic = 'server/' + license_key +'/IO';
  console.log('topic published:',topic);
  return await client.publish(topic, JSON.stringify(topicPayload));
}

function setled (state) {
  client.publish('actuators/led/state', state)
}

function setRelay (state) {
  client.publish('actuators/relay/state', state)
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