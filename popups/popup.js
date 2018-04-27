
var port;

/*
  APP to connect to the background.js
*/
var app = {

  init : function(){
      port = chrome.runtime.connect({name: "Attention Popup"}); //port to connect to background
      port.postMessage({fn:"getSnoozeFlag"});
      port.postMessage({fn:"getUser"});

      port.onMessage.addListener(function(msg) {
          if(msg.fn in app){
            app[msg.fn](msg.message);
          }
      });
    },

  setSnooze: function(response){
    if(response){
      document.getElementById("snooze").innerHTML = "Snooze is ON";
      document.getElementById("snooze").style.borderColor = "#3ED29C";
      document.getElementById("snooze").style.color = "#3ED29C";
    }else {
      document.getElementById("snooze").innerHTML = "Snooze is OFF";
      document.getElementById("snooze").style.borderColor = "#FA5F5F";
      document.getElementById("snooze").style.color = "#FA5F5F";
    }
  },

  setUser: function(response){
    if(response.email != undefined){
      document.getElementById("user-email").innerHTML = response.email;
    }
    if(response.name != undefined){
      document.getElementById("user-name").innerHTML = response.name;
    }
  },

  setMFatigueLevel: function(response){ //change color of the circle missing
    if((Date.now() - response.timestamp) < 600000){
      switch(response.value){
        case 1: app.setMessageFatigue("FULLY ALERT");
                app.setColorBall("#3ED29C");
                document.getElementById("inside-fatigue").innerHTML = response.value;
                break;
        case 2: app.setMessageFatigue("RESPONSIVE");
                app.setColorBall("#3ED29C");
                document.getElementById("inside-fatigue").innerHTML = response.value;
               break;
        case 3: app.setMessageFatigue("SOMEWHAT FRESH");
                app.setColorBall("#3ED29C");
                document.getElementById("inside-fatigue").innerHTML = response.value;
               break;
        case 4: app.setMessageFatigue("A LITTLE TIRED");
                app.setColorBall("#F4CE49");
                document.getElementById("inside-fatigue").innerHTML = response.value;
               break;
        case 5: app.setMessageFatigue("MODERATELY TIRED");
                app.setColorBall("#F4CE49");
                document.getElementById("inside-fatigue").innerHTML = response.value;
               break;
        case 6: app.setMessageFatigue("EXTREMELY TIRED");
                app.setColorBall("#D95050");
                document.getElementById("inside-fatigue").innerHTML = response.value;
               break;
        case 7: app.setMessageFatigue("COMPLETELY EXHAUSTED");
                app.setColorBall("#D95050");
                document.getElementById("inside-fatigue").innerHTML = response.value;
                break;
        default:  document.getElementById("inside-fatigue").innerHTML = "";
                  app.setMessageFatigue("Just Started");
                break;
      }
    } else {
      document.getElementById("inside-fatigue").innerHTML = "";
      app.setMessageFatigue("Away");
      app.setColorBall("#d3d3d3");
    }
  },

  setMessageFatigue: function(response){
    document.getElementById("fatigue_message").innerHTML = response;


  },

  setColorBall: function(response){
    document.getElementById("ball_color").style.backgroundColor = response;
  }
}


/*
  When DOMCONTENTLOADED
*/
document.addEventListener('DOMContentLoaded', function(){
    app.init();

    document.getElementById("open-web-app").addEventListener("click", function(){
      port.postMessage({fn:"accessWebAppLink"});
    });

    chrome.storage.local.get('currentFatiguePerformetric', function(result){
      app.setMFatigueLevel(result['currentFatiguePerformetric']);
    });
});

/*
  function for the login click
*/
$(function(){
  $("#logout").click(function(){
    port.postMessage({fn:"logoutUser"});
    window.close();
  });

  $('#snooze').click(function() {
    if($('#snooze').text() === "Snooze is OFF"){
      port.postMessage({fn:"setSnooze",message:true});
      document.getElementById("snooze").innerHTML = "Snooze is ON";
      document.getElementById("snooze").style.borderColor = "#3ED29C";
      document.getElementById("snooze").style.color = "#3ED29C";
    } else {
      port.postMessage({fn:"setSnooze",message:false});
      document.getElementById("snooze").innerHTML = "Snooze is OFF";
      document.getElementById("snooze").style.borderColor = "#FA5F5F";
      document.getElementById("snooze").style.color = "#FA5F5F";
    }
  });
});

