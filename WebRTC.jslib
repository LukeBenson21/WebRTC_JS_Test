//from https://www.dmcinfo.com/latest-thinking/blog/id/9852/multi-user-video-chat-with-webrtc
//check if have to import WebSocket stuff
//Mic effects https://www.html5rocks.com/en/tutorials/webaudio/intro/

var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var inWater;
var peerConnections = {}; // key is uuid, values are peer connection object and user defined display name string

const peerConnectionConfig = {
  iceServers: [
    {
      urls: "turn:breached-coturn.icedcoffee.dev:7777",
      username: "test123",
      credential: "test",
    },
    //{ urls: "stun:stun.services.mozilla.com" },
  ],
};

//mergeInto(LibraryManager.library, {
function Hello() {
  window.alert("Hello world");
}

// set up local video stream
function start() {
  //need to find a way to assign each client a unique ID - could use players network identity. Something like ...
  console.log("Before getting the network manager");
  localUuid = "_" + Math.random().toString(36).substring(2, 11);
  inWater = true;
  //localUuid = window.unityInstance.SendMessage(
  //"NetworkManager",
  //"GetNetworkIdentity"
  //);
  console.log("Network Identity = " + localUuid);
  localDisplayName = localUuid; //should have a better name here

  var constraints = {
    video: false,
    audio: true,
  };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        if (inWater == true) {
          //node constructors
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          var context = new AudioContext();
          var microphone = context.createMediaStreamSource(stream);
          var destination = context.createMediaStreamDestination();
          var biquadFilter = context.createBiquadFilter();
          //setting values of the filter (causes muffled mic sound)
          biquadFilter.type = "lowpass";
          biquadFilter.frequency.value = 1000;
          console.log(biquadFilter);
          //connect filter and microphone to destination
          microphone.connect(biquadFilter);
          biquadFilter.connect(destination);
          //assign destination to local stream
          localStream = destination.stream;
        } else {
          //standard stream
          localStream = stream;
        }

        console.log("Got MediaStream:", stream);
        //window.unityInstance.SendMessage("MicManager", "MicRecieved");
      })
      .catch(function (errorHandler) {
        console.error("Error getting the mic.", errorHandler);
        //window.unityInstance.SendMessage("MicManager", "MicRejected");
      })

      // set up websocket and message all existing clients
      .then(function () {
        //serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT);
        serverConnection = new WebSocket(
          "wss://breached-webrtc.icedcoffee.dev:7777"
        ); //may need to add port
        serverConnection.onmessage = gotMessageFromServer;
        serverConnection.onopen = function (event) {
          serverConnection.send(
            JSON.stringify({
              displayName: localDisplayName,
              uuid: localUuid,
              dest: "all",
            })
          );
        };
      })
      .catch(function (errorHandler) {
        console.error("Error setting up websocket connection.", errorHandler);
      });
  } else {
    alert("Your browser does not support getUserMedia API");
  }
}
//});
