
class Event(){
    constructor(info,timestamp){
        this.info = info;
        this.timestamp = timestamp;
    }
}


class EventsRecorded {
    constructor(){
        this.events = [];
    }

    addEvent(info,timestamp){
        var aux = new Event(info,timestamp);
        this.events.push(aux);
    }
}
