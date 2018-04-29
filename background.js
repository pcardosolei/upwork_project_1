
var machineState = true; //activity in chrome browser
var connection; //check if there is a connection on the browser

/*
  Records to get saved
*/
var keyRecords = new KeyboardRecords();
var mouseRecords = new MouseRecords();

/*
    Background SCRIPT "APP"
*/

var background = {

  init : function(){
    connection = navigator.onLine ? true : false ; //check if there is a connection on the device

    chrome.runtime.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
        if(msg.fn in background){
            background[msg.fn](port,msg);
          }
      });
    });
  },

  /*
    Connection between script and the background js. saving keys (encrypted) and mouse clicks
  */

  scriptData: function(port,message){
    if(machineState && connection){
      var msg = message.msg;
      switch(msg.type){
        case "MD": //mouseDown
          mouseRecords.addMouseEvent(msg.time, msg.type, msg.button, msg.valueX, msg.valueY, 0);
          break;
        case "MU": //mouseUP
          mouseRecords.addMouseEvent(msg.time, msg.type, msg.button, msg.valueX, msg.valueY, 0);
          break;
        case "MOV": //mouse move
          mouseRecords.addMouseEvent(msg.time, msg.type, msg.type, msg.valueX, msg.valueY, 0);
          break;
        case "KD": //keyDown
          keyRecords.addKeyboardEvent(msg.time,msg.type,msg.key);
          break;
        case "KU": //keyUp
          keyRecords.addKeyboardEvent(msg.time,msg.type,msg.key);
          break;
        default:
          break;
      }
    }
  },

  /*
   Notifications
  */

 notificationLearning: function(){
    if(!snoozeFlag){
      var opt = { type: "basic",
                title: "Performetric",
                message: "Learning phase is now complete",
                iconUrl: "images/38x38.png",
                requireInteraction: true
                };
      chrome.notifications.create("LearningComplete",opt,function(){});
      setTimeout(function(){chrome.notifications.clear("LearningComplete",function(){});},15000);

    }
  }
}

function closePopup(){
  var windows = chrome.extension.getViews({type: "popup"});
  if (windows.length) {
    windows[0].close(); // Normally, there shouldn't be more than 1 popup
  }
}


/* LISTENERS */

/*
    Alarms
*/

chrome.alarms.create("Calculate Fatigue",{when: Date.now() + (5* 60 * 1000),periodInMinutes: 5});

chrome.alarms.onAlarm.addListener(function(alarm){
  if(alarm.name === "Calculate Fatigue"){
    if(connection && loggedIn){
      calculateMetrics();
    } else if (connection && !loggedIn){
        retryLogin();
    }
    clean5minRecords();
  } else if(alarm.name === "Renew History"){ //Faz um login só para renovar todos os dados de 24h em 24h
      checkLoginPossibility();
  } else if(alarm.name === "Break Time"){
    var flag = checkPause(Date.now());
    if(flag){
      notifyPause({ "username" : email, "totalTime" : 0 })
    }
    checkPaused = false;
    recordsPause = [];
    chrome.alarms.clear(alarm.name);
  }
});

/*
  Clean the keyRecords every 5 min
*/
function clean5minRecords(){
  keyRecords.clean();
  mouseRecords.clean();
}


/*
  Collects data and works if chrome is active
  Blocks if the chrome is in idle state
*/
chrome.idle.onStateChanged.addListener(function(estado){
  machineState = estado === "active";
  if(machineState){
    retryLogin();
  }
});

/*
  Iniciar a app BackGround
*/

background.init();
