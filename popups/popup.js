
var port;

/*
  APP to connect to the background.js
*/
var app = {

  init : function(){
      port = chrome.runtime.connect({name: "Ben McMillan Popup"}); //port to connect to background
      port.onMessage.addListener(function(msg) {
          if(msg.fn in app){
            app[msg.fn](msg.message);
          }
      });
    },
}


/*
  When DOMCONTENTLOADED
*/
document.addEventListener('DOMContentLoaded', function(){
    app.init();
});

