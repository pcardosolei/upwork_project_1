var port = chrome.runtime.connect({name: "page script"});


$(document).mousedown(function(e) {
  var clicked = getButtonClicked(e);
  port.postMessage({fn: "scriptData", msg: clicked + " CLICK", time: Date.now()});
});

$(document).mousemove(function(e) {
  port.postMessage({fn: "scriptData", msg:"MOVE MOUSE TO " + event.pageX + "px " + event.pageY + "px",time:Date.now()});
});

// Keyboard
$(document).keydown(function(e) {
  port.postMessage({fn: "scriptData", msg:"KEYPRESS",time: Date.now()});
});

// Resize
$( window ).resize(function() {
  port.postMessage({fn: "scriptData", msg:"RESIZE WINDOW TO " + $(window).height() + "px " + $(window).width() + "px",time: Date.now()})
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




