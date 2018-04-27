
var DOUBLE_CLICK_DURATION = 200;
var TIME_LIMIT = 60000 * 60; //in milliseconds

function MouseEvent(time, t, bt,x,y,d) {
    this.timestamp = time;
    this.button = bt;
    this.type = t;
    this.x = x;
    this.y = y;
    this.delta = d;
}

class MouseRecords {
    constructor(){
        this.username = "";
        this.timestamp = 0;
        this.mv = 0;
        this.ma = 0;
        this.cd = 0;
        this.tbc = 0;
        this.dbc = 0;
        this.ddc = 0;
        this.edbc = 0;
        this.aedbc = 0;
        this.ssdbc = 0;
        this.asdbc = 0;
        this.tdc = 0;
        this.dplbc = 0;
        this.adpbc = 0;
        this.mvV = 0;
        this.maV = 0;
        this.cdV = 0;
        this.tbcV = 0;
        this.dbcV = 0;
        this.ddcV = 0;
        this.edbcV = 0;
        this.aedbcV = 0;
        this.ssdbcV = 0;
        this.asdbcV = 0;
        this.tdcV = 0;
        this.dplbcV = 0;
        this.adpbcV = 0;
        this.LeftClicks = 0;
        this.RightClicks = 0;
        this.MouseDistance = 0;
        this.MouseExcessDistance = 0;
        this.Precision = 0;
        this.records = [];
    }

    processData(){

        this.meanMV();
        this.meanMA();
        this.meanCD();
        this.meanTBC();
        this.meanDBC();
        this.meanDDC();
        this.meanEDBC();
        this.meanAEDBC();
        this.meanSSDBC();
        this.meanASDBC();
        this.meanTDC();
        this.meanADPBC();
        this.meanDPLBC();

        this.varMV();
        this.varMA();
        this.varCD();
        this.varTBC();
        this.varDBC();
        this.varDDC();

        this.varEDBC();

        this.varAEDBC();
        this.varSSDBC();
        this.varASDBC();
        this.varTDC();
        this.varADPBC();
        this.varDPLBC();
        this.CountLeftClicks();
        this.CountRightClicks();
        this.MouseDistanceCalc();
        this.MouseExcessDistanceCalc();

    }

    clean() {
        this.records = [];
    }

    addMouseEvent(time, t, b, x, y, d) {
        var me = new MouseEvent(time, t, b, x, y, d);
        this.records.push(me);
    }

    getAngle(p1, p2, p3) {
        return 180 / Math.PI * (Math.atan2((p3.y - p2.y), (p3.x - p2.x)) - Math.atan2((p2.y - p1.y), (p2.x - p1.x) ));
    }

    MouseDistanceCalc() {

        var result = [];
        var movEvents = [];


        var time = 0;
        var distance = 0;


        for (var i = 0; i < this.records.length; i = i + 1) {
            if (this.records[i].type === "MOV") {
                movEvents.push(this.records[i]);
            }
        }

        for (var j = 0; j < movEvents.length - 1; j = j + 1) {
            if (movEvents[j + 1].timestamp - movEvents[j].timestamp > 0) {
                time = movEvents[j + 1].timestamp - movEvents[j].timestamp;
                if (time < TIME_LIMIT) {
                    distance += Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                }

            }
        }
        this.MouseDistance = Screen.PixelToM(distance);
    }

    PrecisionCalc(max, min, value) {
        if (value <= max && value >= min && max > min && value > 0) {

            var endOfScale = 1;
            var topOfScale = 100;

            var normalized = endOfScale + (value - min) * (topOfScale - endOfScale) / (max - min);


            this.Precision = 100 - normalized;
        } else {
            if (value < min) {
                this.Precision = 100;
            } else {
                this.Precision = 0;
            }
        }
    }

    MouseExcessDistanceCalc() {

        var result = [];
        var movEvents = [];

        var distance1 = 0;
        var shortDistane = 0;
        var excess = 0;

        var pixelCM = Screen.CmToPixel(1.0);

          for (var i = 0; i < this.records.length; i = i + 1 ){
              if (this.records[i].type === ("MOV"))
                  movEvents.push(this.records[i]);
          }

          for (var j = 0; j < movEvents.length - pixelCM; j += pixelCM)
          {

              distance1 = 0;
              for (var k = j; k < j + pixelCM - 1; k = k + 1) {
                  distance1 +=  Math.sqrt(Math.pow(movEvents[k + 1].x - movEvents[k].x, 2.0) + Math.pow(movEvents[k + 1].y - movEvents[k].y, 2.0));

              }
              shortDistane = Math.sqrt(Math.pow(movEvents[j + pixelCM-1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + pixelCM-1].y - movEvents[j].y, 2.0));
              excess += distance1  - shortDistane;

          }
        this.MouseExcessDistance = Screen.PixelToM(excess);
    }

    CountRightClicks() {
        var query = [];
        for(var i = 0; i < this.records.length; i = i + 1){
            if(this.records[i].type === "MD" && this.records[i].button === "Right"){
                query.push(this.records[i]);
            }
        }
        this.RightClicks = query.length;
    }

    CountLeftClicks() {
        var query = [];
        for(var i = 0; i < this.records.length; i = i + 1){
            if((this.records[i].type === "MD") && (this.records[i].button === "Left")){
                query.push(this.records[i]);
            }
        }
        this.LeftClicks = query.length;
    }

    mouseVelocity(data) {


        var result = [];
        var movEvents = [];

        var vl = 0;
        var time = 0;
        var distance = 0;


        for (var i = 0; i < data.length; i = i + 1) {
            if (data[i].type === "MOV") {
                movEvents.push(data[i]);
            }
        }

        for (var j = 0; j < movEvents.length - 2; j = j + 3) {
            if (movEvents[j + 1].timestamp - movEvents[j].timestamp > 0 ) {
                time = movEvents[j + 1].timestamp - movEvents[j].timestamp;
                if (time < TIME_LIMIT) {
                    distance = Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                    vl = distance / time;
                    if (vl > 0) {
                        result.push(vl);
                    }
                }

            }
        }
        return result;
    }

    mouseAcceleration(data) {


        var result = [];
        var movEvents = [];


        var vel1, vel2, reusltD;
        var time = 0;


        for (var i = 0; i < data.length; i = i + 1) {
            if (data[i].type === "MOV") {
                movEvents.push(data[i]);
            }
        }


        for (var j = 0; j < movEvents.length - 2; j = j + 2) {
            if ((movEvents[j + 2].timestamp - movEvents[j + 1].timestamp > 0) && (movEvents[j + 1].timestamp - movEvents[j].timestamp > 0)) {

                var distance = Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                var distance2 = Math.sqrt(Math.pow(movEvents[j + 2].x - movEvents[j + 1].x, 2.0) + Math.pow(movEvents[j + 2].y - movEvents[j + 1].y, 2.0));

                vel1 = distance / (movEvents[j + 1].timestamp - movEvents[j].timestamp);
                vel2 = distance2 / (movEvents[j + 2].timestamp - movEvents[j + 1].timestamp);

                if (vel1 > 0 && vel2 > 0) {
                    time = (movEvents[j + 2].timestamp - movEvents[j].timestamp);
                    if (time < TIME_LIMIT) {
                        reusltD = vel2 - vel1 / time;


                        result.push(reusltD);
                    }
                }
            }
        }
        return result;
    }

    clickDurations(data) {
        var result = [];
        var s_time = 0;
        var time = 0;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                time = data[i].timestamp - s_time;
                if (time < TIME_LIMIT) {
                    result.push(time);
                }
            }
            if ((data[i].type === "MD") && (data[i].button === "Left")){
                s_time = data[i].timestamp;
            }
        }
        return result;
    }

    timeBetweenClicks(data) {

        var result = [];
        var time = 0;

        var start_time = 0;
        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                start_time = data[i].timestamp;
            }
            if ((data[i].type === "MD") && (data[i].button === "Left") && (start_time !== 0)) {
                time = data[i].timestamp - start_time;
                if (time < TIME_LIMIT) {
                    result.push(time);
                }
            }
        }
        return result;
    }

    distanceBetweenClicks(data) {

        var result = [];

        var movement_sum = 0.0;
        var start_time = 0;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                start_time = data[i].timestamp;
                movement_sum = 0.0;

                var movEvents = [];
                while (!(data[i].type === "MD") && (i < (data.length - 1))) {
                    i = i + 1;
                    if (data[i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }
                for (var j = 0; j < movEvents.length - 1; j = j + 3) {
                    movement_sum += Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                }

                result.push(movement_sum);
                movement_sum = 0.0;
            }
        }

        return result;
    }

    distanceDuringClicks(data) {
        var result = [];

        var movement_sum = 0.0;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MD") && (data[i].button === "Left")) {
                movement_sum = 0.0;
                var movEvents = [];
                while ((data[i].type != "MU")  && (i < data.length - 1)) {

                    i = i + 1;
                    if (data[i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }

                for (var j = 0; j < (movEvents.length - 1); j = j + 1) {
                    movement_sum += Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                }

                if (movement_sum > 0) {
                    result.push(movement_sum);
                }
                movement_sum = 0.0;
            }
        }
        return result;
    }

    distancePointerToLineBetweenClicks(data) {

        var result = [];

        var x1, x2, y1, y2;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                var movEvents = [];
                while (!(data[i].type === ("MD")) && i < data.length - 1) {
                    if (data[++i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }
                if (movEvents.length > 0) {

                    x1 = movEvents[0].x;
                    y1 = movEvents[0].y;
                    x2 = movEvents[movEvents.length - 1].x;
                    y2 = movEvents[movEvents.length - 1].y;

                    //compute distance of each point of the mouse to the line
                    var distance_sum = 0;
                    for (var j = 0; j < movEvents.length; j = j + 1) {
                        distance_sum += Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
                    }

                    result.push(distance_sum);
                }
            }
        }
        return result;
    }

    averageDistancePointerToLineBetweenClicks(data) {

        var result = [];

        var x1, x2, y1, y2;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                var movEvents = [];
                while (!(data[i].type === "MD") && i < data.length - 1){
                    if ((data[++i].type === "MOV")) {
                        movEvents.push(data[i]);
                    }
                }
                if (movEvents.length > 0) {
                    x1 = movEvents[0].x;
                    y1 = movEvents[0].y;
                    x2 = movEvents[movEvents.length - 1].x;
                    y2 = movEvents[movEvents.length - 1].y;

                    //compute distance of each point of the mouse to the line
                    var distance_sum = 0;
                    for (var j = 0; j < movEvents.length; j = j + 1) {
                        distance_sum += (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2 , 2));
                    }
                    result.push(distance_sum / movEvents.length);
                }
            }
        }
        return result;
    }

    excessOfDistanceBetweenClicks(data) {
        var result = [];

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                var movEvents = [];
                while (!(data[i].type === "MD" && data[i].button === "Left") && (i < data.length - 1)) {
                    if (data[++i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }
                if (movEvents.length > 0) {
                    //distance between the two clicks in straight line
                    var distance = Math.sqrt(Math.pow(movEvents[0].x - movEvents[movEvents.length - 1].x, 2.0) + Math.pow(movEvents[0].y - movEvents[movEvents.length - 1].y, 2.0));

                    //compute the distance walked by the mouse
                    var distance_sum = 0;
                    for (var j = 0; j < movEvents.length - 1; j = j + 1) {
                        distance_sum += Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                    }
                    result.push(distance_sum - distance);
                }
            }
        }
        return result;
    }

    averageExcessOfDistanceBetweenClicks(data) {

        var result = [];

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && data[i].button === "Left") {
                var movEvents = [];
                while (!(data[i].type === "MD" && data[i].button === "Left") && i < (data.length - 1)) {
                    if (data[++i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }

                if (movEvents.length > 0) {
                    //distance between the two clicks in straight line
                    var distance = Math.sqrt(Math.pow(movEvents[0].x - movEvents[movEvents.length - 1].x, 2.0) + Math.pow(movEvents[0].y - movEvents[movEvents.length - 1].y, 2.0));

                    //compute the distance walked by the mouse
                    var distance_sum = 0;
                    for (var j = 0; j < movEvents.length - 1; j = j + 1) {
                        distance_sum += Math.sqrt(Math.pow(movEvents[j + 1].x - movEvents[j].x, 2.0) + Math.pow(movEvents[j + 1].y - movEvents[j].y, 2.0));
                    }

                    result.push(distance_sum / distance);
                }
            }
        }
        return result;
    }

    signedSumofDegreesBetweenClicks(data) {
        var result = [];

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && data[i].button === "Left") {
                var movEvents = [];
                while (!(data[i].type === "MD") && i < (data.length - 1)) {
                    if (data[++i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }

                if (movEvents.length > 0) {
                    var angle_sum = 0;

                    for (var j = 0; j < movEvents.length - 2; j = j + 1) {
                        angle_sum += this.getAngle(movEvents[j], movEvents[j + 1], movEvents[j + 2]);
                    }
                    result.push(angle_sum);
                }
            }
        }
        return result;
    }

    absoluteSumofDegreesBetweenClicks(data) {
        var result = [];

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                var movEvents = [];
                while (!(data[i].type === "MD") && i < (data.length - 1)) {
                    if (data[++i].type === "MOV") {
                        movEvents.push(data[i]);
                    }
                }
                if (movEvents.length > 0) {
                    var angle_sum = 0;

                    for (var j = 0; j < movEvents.length - 2; j = j + 1) {
                        angle_sum += Math.abs(this.getAngle(movEvents[j], movEvents[j + 1], movEvents[j + 2]));
                    }
                    result.push(angle_sum);
                }
            }
        }
        return result;
    }

    timeDoubleClicks(data) {
        var result = [];

        var previous_time = 0;
        var first = true;
        var time = 0;

        for (var i = 0; i < data.length; i = i + 1) {
            if ((data[i].type === "MU") && (data[i].button === "Left")) {
                if (first) {
                    previous_time = data[i].timestamp;
                    first = false;
                } else {

                    time = data[i].timestamp - previous_time;
                    if (time < DOUBLE_CLICK_DURATION && time > 0) { //it is a double click{

                        if (time < TIME_LIMIT) {
                            result.push(time);
                        }
                    }
                    previous_time = data[i].timestamp;
                }
            }
        }
        return result;
    }

    meanMV(){
        this.mv = Statistics.Mean(Statistics.FilterOutLiers(this.mouseVelocity(this.records)));
    }

    varMV(){
        this.mvV = Statistics.Variance(Statistics.FilterOutLiers(this.mouseVelocity(this.records)));
    }

    meanMA(){
        this.ma = Statistics.Mean(Statistics.FilterOutLiers(this.mouseAcceleration(this.records)));
    }

    varMA(){
        this.maV = Statistics.Variance(Statistics.FilterOutLiers(this.mouseAcceleration(this.records)));
    }

    meanCD(){
        this.cd = Statistics.Mean(Statistics.FilterOutLiers(this.clickDurations(this.records)));
    }

   varCD(){
        this.cdV = Statistics.Variance(Statistics.FilterOutLiers(this.clickDurations(this.records)));
    }

    meanTBC(){
        this.tbc = Statistics.Mean(Statistics.FilterOutLiers(this.timeBetweenClicks(this.records)));
    }

    varTBC(){
        this.tbcV = Statistics.Variance(Statistics.FilterOutLiers(this.timeBetweenClicks(this.records)));
    }

    meanDBC(){
        this.dbc = Statistics.Mean(Statistics.FilterOutLiers(this.distanceBetweenClicks(this.records)));
    }

    varDBC(){
        this.dbcV = Statistics.Variance(Statistics.FilterOutLiers(this.distanceBetweenClicks(this.records)));
    }

    meanDDC(){
       this.ddc = Statistics.Mean(Statistics.FilterOutLiers(this.distanceDuringClicks(this.records)));
    }

    varDDC(){
        this.ddcV = Statistics.Variance(Statistics.FilterOutLiers(this.distanceDuringClicks(this.records)));
    }

    meanEDBC(){
        this.edbc = Statistics.Mean(Statistics.FilterOutLiers(this.excessOfDistanceBetweenClicks(this.records)));
    }

    varEDBC(){
        this.edbcV = Statistics.Variance(Statistics.FilterOutLiers(this.excessOfDistanceBetweenClicks(this.records)));
    }

    meanAEDBC(){
        this.aedbc = Statistics.Mean(Statistics.FilterOutLiers(this.averageExcessOfDistanceBetweenClicks(this.records)));
    }

     varAEDBC(){
        this.aedbcV = Statistics.Variance(Statistics.FilterOutLiers(this.averageExcessOfDistanceBetweenClicks(this.records)));
    }

    meanSSDBC(){
        this.ssdbc = Statistics.Mean(Statistics.FilterOutLiers(this.signedSumofDegreesBetweenClicks(this.records)));
    }

    varSSDBC(){
        this.ssdbcV = Statistics.Variance(Statistics.FilterOutLiers(this.signedSumofDegreesBetweenClicks(this.records)));
    }

    meanASDBC(){
        this.asdbc = Statistics.Mean(Statistics.FilterOutLiers(this.absoluteSumofDegreesBetweenClicks(this.records)));
    }

    varASDBC(){
        this.asdbcV = Statistics.Variance(Statistics.FilterOutLiers(this.absoluteSumofDegreesBetweenClicks(this.records)));
    }

    meanADPBC(){
        this.adpbc = Statistics.Mean(Statistics.FilterOutLiers(this.averageDistancePointerToLineBetweenClicks(this.records)));
    }

    varADPBC(){
        this.adpbcV = Statistics.Variance(Statistics.FilterOutLiers(this.averageDistancePointerToLineBetweenClicks(this.records)));
    }

    meanDPLBC(){
        this.dplbc = Statistics.Mean(Statistics.FilterOutLiers(this.distancePointerToLineBetweenClicks(this.records)));
    }

    varDPLBC(){
        this.dplbcV = Statistics.Variance(Statistics.FilterOutLiers(this.distancePointerToLineBetweenClicks(this.records)));
    }

    meanTDC(){
        this.tdc = Statistics.Mean(Statistics.FilterOutLiers(this.timeDoubleClicks(this.records)));
    }

    varTDC(){
        this.tdcV = Statistics.Variance(Statistics.FilterOutLiers(this.timeDoubleClicks(this.records)));
    }
}

/* TESTING

function readyFn(){
    var test = new MouseRecords();

    $.getJSON("../testing/rato1.json", function(json) {
        // this will show the info it in firebug console
        var test_records = json.records;
        for(var i in test_records){
            test.addMouseEvent(test_records[i]["timestamp"],test_records[i]["type"],test_records[i]["button"],test_records[i]["x"],test_records[i]["y"],test_records[i]["delta"]);
        }

        test.processData();
        console.log(test);
    });

}

readyFn();


*/
