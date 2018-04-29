var port = chrome.runtime.connect({name: "page script"});


$(document).mousedown(function(e) { //mouseDown
  var clicked = getButtonClicked(e);
  port.postMessage({fn:"scriptData",msg:{type: "MD", button: clicked, time: Date.now(), valueX: e.pageX, valueY: e.pageY}});
});
$(document).mouseup(function(e) { //mouseUp
  var clicked = getButtonClicked(e);
  port.postMessage({fn:"scriptData",msg:{type: "MU", button: clicked, time: Date.now(), valueX: e.pageX, valueY: e.pageY}});
});

$(document).mousemove(function(e) { //mouseMove
  port.postMessage({fn:"scriptData",msg:{type: "MOV",time:Date.now(),valueX: e.pageX,valueY: e.pageY}});
});

// Keyboard
$(document).keydown(function(e) { //keyDOWN
  var key = getKeyPressed(e);
  port.postMessage({fn:"scriptData",msg:{type: "KD",time: Date.now(),key: key}});
});

$(document).keyup(function(e) { //keyUP
  var key = getKeyPressed(e);
  port.postMessage({fn:"scriptData",msg:{type: "KU",time: Date.now(),key: key}});
});



/*
  pass port here on resize
*/
$( window ).resize(function() {
  console.log( "RESIZE WINDOW TO " + $( window ).height() + " " + $( window ).width() + " " );
});


function getButtonClicked(e){
    switch (event.which) {
      case 1:
          return "Left";
          break;
      case 2:
          return "Middle";
          break;
      case 3:
          return "Right";
          break;
    }
}


function getKeyPressed(e){
  if(e.keyCode == 8 || e.keyCode == 46){
    return "ERROR"
  } else {
    return md5(e.key);
  }
}




