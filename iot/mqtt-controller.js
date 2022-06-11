// controller.js
const mqtt = require('mqtt');
const { subscribe } = require('../routes/applications/users');
/*
const client = mqtt.connect('da4cea57792c41b6be6304e4ece822b0.s1.eu.hivemq.cloud', {
    rejectUnauthorized: false,
    protocol: 'MQTTS'
});
*/
const client = mqtt.connect('broker.hivemq.com', {
  //rejectUnauthorized: false,
  protocol: 'MQTT'
});

var temperatureValue = -1;
var connected = false;

client.on('connect', () => {
  client.subscribe('board/connected');
});

client.on('message', (topic, message) => {
  switch (topic) {
    case 'board/connected':
      return handleBoardConnected(message)
    case 'sensors/temperature/value':
      return handleTemperatureSensorValue(message)
  }
  console.log('No handler for topic %s', topic)
});

function subscribeToBoardData(boardData) {
  for (let i = 0; i < boardData.device_setup.length; i++) {
    let IO_Element = boardData.device_setup[i];
    // board IO Elements topics syntax structure
    // |--> board/boardID/IO/PIN 
    console.log('PIN:',IO_Element.PIN)
    let topic = 'board/' + boardData.board_id + '/IO/' + IO_Element.PIN;
    client.subscribe(topic);
  }
}

function handleBoardConnected (message) {
  let boardData = JSON.parse(message);
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

  subscribeToBoardData(boardData);
  
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