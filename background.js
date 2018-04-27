
var machineState = true; //activity in chrome browser
var machineSystem = {}; //information about the machine using the software
var connection; //check if there is a connection on the browser

var learning = false; //flag to see if its on the learning phase
var lengthLearning; // <300 data learning

var lastTimestamp = Date.now(); //last timestamp to check for pause
var checkPaused = false; //when a alarm to recomendUser pops off

/*
  Records to get saved
*/
var keyRecords = new KeyboardRecords();
var mouseRecords = new MouseRecords();

/*
  Calculate pause, saving 20min of records
*/
var recordsPause = []

/*
  To get information about the browser via framework Client JS
*/

function getBrowserData(){
  var client =  new ClientJS();
  var data = client.getBrowserData();
  machineSystem = data.ua;
}

/*
  Context Menus
*/

chrome.contextMenus.removeAll();
chrome.contextMenus.create({ id: "webapp", title: "View More",contexts: ["browser_action"]});
chrome.contextMenus.create({ id: "snooze", title: "Snooze", contexts: ["browser_action"]});
chrome.contextMenus.create({ id: "logout", title: "Logout",contexts: ["browser_action"]});

chrome.contextMenus.onClicked.addListener(function(info,tab) {
  switch(info.menuItemId){
    case "logout":  background.logoutUser();
                    break;
    case "webapp":  background.accessWebAppLink();
                    break;
    case "snooze":  snoozeFlag = true;
                    break;
    default: break;
  }
});

/*
    Background SCRIPT "APP"
*/

var background = {

  init : function(){

    getBrowserData();
    connection = navigator.onLine ? true : false ; //check if there is a connection on the device

    chrome.runtime.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
        if(msg.fn in background){
            background[msg.fn](port,msg);
          }
      });
    });
    background.automaticLogin();
  },

  tryLoginTalkDesk: function(port,msg){
    loginTalkDesk(msg.message);
  },

  automaticLogin: function(){
    if(connection){
      checkLoginPossibility();
    } else {
      background.noConnectionDetected();
    }
  },

  getUser: function(port,msg){
    port.postMessage({fn:"setUser",message: {email: email, name: username}});
  },

  getLearning: function(port,msg){
    message = { learning: Math.round(( lengthLearning / 300 ) * 100 ) , user: email }
    port.postMessage({fn:"setData", message: message });
  },

  getSnoozeFlag: function(port,msg){
    port.postMessage({fn:"setSnooze", message:snoozeFlag});
  },

  setSnooze: function(port,msg){
    snoozeFlag = msg.message;
  },

  accessWebAppLink: function(port,msg){
    accessWebAppLink();
  },

  /*
    Login with notification
  */

  loggedIn: function(){
    chrome.browserAction.setPopup({
      popup: 'popups/actual_fatigue.html'
    });
    chrome.browserAction.setIcon({path:"images/38x38.png"});
    background.sendLoginSucessNotif();
  },

  /*
    Connection between script and the background js. saving keys (encrypted) and mouse clicks
  */

  scriptData: function(port,message){
    if(loggedIn && machineState && connection){
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

  unsuccessfullTalkDesk: function(){
    if(!snoozeFlag){
      var opt = { type: "basic",
                title: "Performetric",
                message: "No Company Present",
                iconUrl: "images/38x38.png",
                requireInteraction: true
              }
      chrome.notifications.create("loginTalkDesk",opt,function(){});
      setTimeout(function(){chrome.notifications.clear("loginTalkDesk",function(){});},15000);
    }
  },

  sendLoginSucessNotif: function() {
   if(!snoozeFlag){
      var opt = { type: "basic",
                title: "Performetric",
                message: "Login Successful",
                iconUrl: "images/38x38.png",
                requireInteraction: true,
                buttons: [{
                            title: "View More",
                            iconUrl: "images/19x19.png"
                          },
                          {
                            title: "Snooze",
                            iconUrl: "images/19x19_grey.png"
                          }]
                };
      chrome.notifications.create("loginSucessful",opt,function(){});
      setTimeout(function(){chrome.notifications.clear("loginSucessful",function(){});},15000);
    }
  },

  sendLoginUnsucessNotif: function() {
   if(!snoozeFlag){
      var opt = { type: "basic",
                title: "Performetric",
                message: "Username or password not valid",
                iconUrl: "images/38x38.png",
                requireInteraction: true
                };
      chrome.notifications.create("loginSucessful",opt,function(){});
      setTimeout(function(){chrome.notifications.clear("loginSucessful",function(){});},15000);
    }
  },


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


/*
  add new Normalized details to the historyc to be used on the next normalization
*/

function addValue(details){
  if(historyUserRecords.length == 3500){
      historyUserRecords.push(details);
      historyUserRecords.pop();
  } else {
    historyUserRecords.push(details);
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
chrome.alarms.create("Renew History",{when: Date.now() + (1440 * 60 * 1000),periodInMinutes: 1440});

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
  Event listeners for the notifications.
*/

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx){
  if (btnIdx === 0) {
      accessWebAppLink();
  } else if (btnIdx === 1) { // if it is needed another button
    snoozeFlag = true;
    var opt = { type: "basic",
      title: "Performetric",
      message: "Notifications are now disabled",
      iconUrl: "images/38x38.png",
      requireInteraction: true
    }
    chrome.notifications.create("snoozeON",opt,function(){});
    setTimeout(function(){chrome.notifications.clear("snoozeON",function(){});},15000);
  }
});

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
