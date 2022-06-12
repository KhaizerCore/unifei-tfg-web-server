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

var temperatureValue = -1;
var connected = false;

client.on('connect', () => {
  client.subscribe('board/connected');
});

client.on('message', (topic, message) => {
  processTopicMessage(topic, message);  
});

function validBoardIOTopicReturnTopicBoardID(topic) {
  return (topic.includes('board/') &&  topic.includes('/IO')) ? 
    topic.substring(
      topic.lastIndexOf('board/') + String('board/').length,
      topic.lastIndexOf('/IO')
    ) 
    : false;
}

function processTopicMessage(topic, message) {
  message = JSON.parse(message);
  
  switch (topic) {
    case 'board/connected':
      return handleBoardConnected(message);
  }

  if (validBoardIOTopicReturnTopicBoardID(topic)) {
    if (validBoardIOTopicReturnTopicBoardID(topic) == message.board_id)
      return handleBoardIOValues(message);
  }

  console.log('No handler for topic %s', topic);
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
      device_setup  : [
        {
            "IO_TYPE" : "INPUT",
            "PIN" : 2,
            "SENSOR_CODE" : "DHT-22",
            "VALUE" : 27,
            "VALUE_TYPE" : "INT" 
        },
        {
            "IO_TYPE" : "OUTPUT",
            "PIN" : 5,
            "SENSOR_CODE" : "GENERIC-LED",
            "VALUE": true,
            "VALUE_TYPE" : "BOOL" 
        }
      ]
    }
  */
  console.log('board connected', boardData);

  subscribeToBoardIO(boardData.board_id);
  
}

function handleTemperatureSensorValue (message) {
  temperatureValue = message
  console.log('Received temperature value at board ambient %s', message)
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
    }, 2000)
  }, 2000)
}

exports = client;