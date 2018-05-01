
var machineState = true; //activity in chrome browser
var connection; //check if there is a connection on the browser

/*
  Records to get saved
*/
var eventsRecords = new EventsRecorded();

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

  scriptData: function(port,message){
    if(machineState && connection)
      eventsRecords.addEvent(message.msg,message.time);
  },

  createPDF: function(port,message){
    var doc = new jsPDF();
    doc.text('This file was created on a chrome extension', 10, 10);
    console.log(eventsRecords.events.length);
    for(var i = 0; i < eventsRecords.events.length; i++)
      doc.text(eventsRecords.events[i].msg + " Date: " + eventsRecords.events[i].time, 10, 10);
    doc.save('a4.pdf');
    eventsRecords.clean();
  },

  createAlarmForCreatePDF: function(port,message){
    chrome.alarms.create("Record PDF",{when: Date.now() + (message.value * 60 * 1000)});
  },

  /*
   Notifications
  */
 notificationLearning: function(){
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

/*
  Alarms
*/

chrome.alarms.onAlarm.addListener(function(alarm){
  if(alarm.name === "Record PDF"){
    background.createPDF();
    chrome.alarms.clear(alarm.name);
  }
});

/*
  Collects data and works if chrome is active
  Blocks if the chrome is in idle state
*/

chrome.idle.onStateChanged.addListener(function(estado){
  machineState = estado === "active";
});

/*
  Iniciar a app BackGround
*/

background.init();
