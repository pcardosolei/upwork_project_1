var TIME_BETWEEN_KEYS_LIMIT = 5000; //in milliseconds
var MINUTE = 60000; //in milliseconds

function KeboardEvent(time, type, key) {
    this.timestamp = time;
    this.Type = type;
    this.key = key;
}

class KeyboardRecords {
    constructor(){
        this.username = " ";
        this.timestamp = " ";
        this.kdt = 0;
        this.tbk = 0;
        this.wv = 0;
        this.kdtV = 0;
        this.tbkV = 0;
        this.keysPressed = 0;
        this.errorPerKey = 0;
        this.records = [];
    }

    clean() {
        this.records = []
    }

    addKeyboardEvent(time,type,key){ //done
        var ke = new KeboardEvent(time,type,key);
        this.records.push(ke);
    }

    processData(){ //done
        this.meanKDT();
        this.meanTBK();
        this.VarKDT();
        this.VarTBK();
        this.meanWV();
        this.CountKeys();
        this.ErrorPerKey();
    }

    addRecord(record){ //done
        this.records.push(record);
    }

    getRecords() { //done
        return this.records;
    }

    totalRecords() { //done
        return this.records.length;
    }

    CountKeys() { //done
        var query = [];
        for(var i = 0; i < this.records.length; i = i + 1){
            if(this.records[i].Type === "KD"){
                query.push(this.records[i]);
            }
        }
        this.keysPressed = query.length;
        return this.keysPressed;
    }

    ErrorPerKey() { //done
        var query = [];
        for(var i = 0; i < this.records.length; i = i + 1){
            if(this.records[i].Type === "KD" && this.records[i].key === "ERROR"){
                query.push(this.records[i]);
            }
        }
        var errorKeys = query.length;
        var totalKeys = this.CountKeys();
        if (totalKeys > 0) {
            this.errorPerKey = (errorKeys / totalKeys) * 100;
        } else {
            this.errorPerKey = -100;
        }
    }

    WritingVelocity(aux) { //done

        var previous_time = 0;
        var first = true;
        var time;
        var total = 0;
        var result = [];

        for (var i = 0; i < aux.length; i = i + 1) {
            if (aux[i].Type === "KD") {
                if (first) {
                    previous_time = aux[i].timestamp;
                    first = false;
                } else {
                    time = aux[i].timestamp - previous_time;
                    if (time < MINUTE && time > 0) {
                        total++;
                    } else {
                        if (total > 0) {
                            result.push(total);
                        }
                        total = 0;
                        previous_time = aux[i].timestamp;
                    }
                }
            }
        }
        // caso de só um minuto ter dados
        if (total > 0) {
            result.push(total);
        }
        return result;
    }

    TimeBetweenKeys(data) { //done

        var result = [];
        var start_time = 0;
        var time = 0;
        for (var i = 0; i < data.length; i = i + 1) {
            if (data[i].Type === "KU") {
                start_time = data[i].timestamp;
            }
            if (data[i].Type === "KD" && start_time !== 0) {
                time = data[i].timestamp - start_time;
                if (time < TIME_BETWEEN_KEYS_LIMIT) {
                    result.push(time);
                }
            }
        }
        return result;
    }

    KeyDownTime(data) { //done

        var result = [];
        var e = 0;
        var s_time = 0;
        var code = null;
        var j = 0;
        var stop = false;
        for (var i = 0; i < data.length; i = i + 1) {
            if (data[i].Type === "KD") {
                s_time = data[i].timestamp;
                code = data[i].key;
            }
            j = i;
            stop = false;
            while (j < data.length && stop === false) {
                if ((data[j].Type === "KU") && (data[j].key === code)) {
                    e = data[j].timestamp - s_time;
                    stop = true;
                    if (e > 0) {
                        result.push(e);
                    }
                }
                j = j + 1
            }
        }
        return result;
    }

    meanWV(){
        this.wv = Statistics.Mean(this.WritingVelocity(this.records));
    }

    meanKDT(){
       this.kdt = Statistics.Mean((Statistics.FilterOutLiers(this.KeyDownTime(this.records))));
    }

    meanTBK(){
        this.tbk = Statistics.Mean((Statistics.FilterOutLiers(this.TimeBetweenKeys(this.records))));
    }

    VarTBK(){
        this.tbkV = Statistics.Variance((Statistics.FilterOutLiers(this.TimeBetweenKeys(this.records))));
    }

    VarKDT(){
        this.kdtV = Statistics.Variance((Statistics.FilterOutLiers(this.KeyDownTime(this.records))));
    }
}

/* TESTING

function readyFn(){
    var test = new KeyboardRecords();

    $.getJSON("../testing/teclado3.json", function(json) {
        // this will show the info it in firebug console
        var test_records = json.records;
        for(var i in test_records){
            test.addKeyboardEvent(test_records[i]["timestamp"],test_records[i]["Type"],test_records[i]["key"]);
        }

        test.processData();
        console.log(test);
    });

}

readyFn();

*/

