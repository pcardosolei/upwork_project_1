var startRecord = false;
var startDate;

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
    if(startRecord)
      eventsRecords.addEvent(message.msg);
  },

  createPDF: function(port,message){
    startRecord = false;
    var y = 20;
    var doc = new jsPDF();
    doc.setFontType("bold");
    doc.setFontSize(11);
    doc.text('TRACKING FROM: ' + startDate, (doc.internal.pageSize.width / 2) , y, 'center');

    doc.setFontType("normal");
    doc.setFontSize(9);
    pageHeight= doc.internal.pageSize.height;

    // Before adding new content
    for(var i = 0; i < eventsRecords.events.length; i++){
      if (y >= pageHeight - 19){
        doc.addPage();
        y = 0 // Restart height position
      }
      y += 10;
      doc.text(eventsRecords.events[i].info, (doc.internal.pageSize.width / 2), y, 'center' );
    }
    var time = new Date().getTime();
    doc.setFontType("bold");
    doc.setFontSize(11);
    doc.text('TRACKING ENDED:' + Date(time).toString().split("GMT")[0],(doc.internal.pageSize.width / 2),y+10,'center');
    doc.save('recordStart.pdf');
    eventsRecords.clean();
  },

  createAlarmForCreatePDF: function(port,message){
    closePopup();
    chrome.alarms.create("Record PDF",{when: Date.now() + (message.value * 60 * 1000)});
    var time = new Date().getTime();
    startDate = new Date(time).toString();
    this.recordingStarted();
    startRecord = true;

  },

  /*
   Notifications
  */
 recordingStarted: function(){
      var opt = { type: "basic",
                title: "Recording",
                message: "It started to record",
                iconUrl: "images/icon_128.png",
                requireInteraction: false
                };
      chrome.notifications.create("RecordStarted",opt,function(){});
      setTimeout(function(){chrome.notifications.clear("RecordStarted",function(){});},15000);
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
  eventsRecords.addEvent("BROWSER BECAME " + estado);
});

/*
  Full screen listener
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message === 'getScreenState') {
        chrome.windows.get(sender.tab.windowId, function(chromeWindow) {
            // "normal", "minimized", "maximized" or "fullscreen"
            eventsRecord.addEvent("CHROME IS " + chromeWindow.state + " SIZE");
        });
    }
});

/*
  Tabs
*/

chrome.tabs.onRemoved.addListener(function(){
  eventsRecords.addEvent("TAB REMOVED");
});

chrome.tabs.onCreated.addListener(function(){
  eventsRecords.addEvent("TAB CREATED");
});

chrome.tabs.onUpdated.addListener(function(){
  eventsRecords.addEvent("TAB UPDATED");
});

chrome.tabs.onActivated.addListener(function(){
  eventsRecords.addEvent("TAB CHANGED");
});

/*
  Popup
*/

function closePopup(){
  var windows = chrome.extension.getViews({type: "popup"});
  if (windows.length) {
    windows[0].close(); // Normally, there shouldn't be more than 1 popup
  }
}

/*
  Connectivity
*/

window.addEventListener('online', function(e) {
  // Re-sync data with server.
  eventsRecords.addEvent("INTERNET ON");
}, false);

window.addEventListener('offline', function(e) {
  // Queue up events for server.
  eventsRecords.addEvent("INTERNET OFF");
}, false);

/*
  Iniciar a app BackGround
*/

background.init();
