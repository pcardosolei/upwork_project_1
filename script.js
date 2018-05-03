var port = chrome.runtime.connect({name: "page script"});

var lastScrollTop = window.pageYOffset;

$(document).mousedown(function(e) {
  var clicked = getButtonClicked(e);
  port.postMessage({fn: "scriptData", msg: clicked + " CLICK"});
});

$(document).mousemove(function(e) {
  port.postMessage({fn: "scriptData", msg:"MOVE MOUSE TO " + event.pageX + "px " + event.pageY + "px"});
});

// Keyboard
$(document).keydown(function(e) {
  port.postMessage({fn: "scriptData", msg:"KEYPRESS"});
});

// Resize
$( window ).resize(function() {
  port.postMessage({fn: "scriptData", msg:"RESIZE WINDOW TO " + $(window).height() + "px " + $(window).width() + "px"})
});


// Scroll
$( window).scroll(function(){
  var st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScrollTop){
    port.postMessage({fn: "scriptData", msg:"SCROLL DOWN"});
   } else {
    port.postMessage({fn: "scriptData", msg:"SCROLL UP"});
  }
  lastScrollTop = st;
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




