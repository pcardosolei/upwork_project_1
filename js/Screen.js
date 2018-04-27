class Screen {

  static PixelToCM(pixels){
    var DPI = res.dpi();
    return pixels * 2.54 / DPI;
  }

  static CmToPixel(cm){
    var DPI = res.dpi();
    return Math.round(cm * DPI / 2.54)  ;
  }

  static PixelToM(pixels){
    var DPI = res.dpi();
    var cm = pixels * 2.54 / DPI;
    return cm / 100;
  }

}

/*

// Create a new ClientJS object
var client = new ClientJS();

// Get the client's fingerprint id
var fingerprint = client.getBrowserData();

var xdpi = client.getDeviceXDPI(); //undefined
var ydpi = client.getDeviceYDPI(); //undefined

// Print the 32bit hash id to the console
console.log(fingerprint);
console.log(xdpi);
console.log(ydpi);

console.log(client.getCurrentResolution());


// com o res.js --
console.log(res.dppx());
console.log(res.dpi());

*/
