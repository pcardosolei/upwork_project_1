
class Event{
    constructor(info){
        this.info = info;
    }
}


class EventsRecorded {
    constructor(){
        this.events = [];
    }

    addEvent(info){
        var aux = new Event(info);
        this.events.push(aux);
    }

    getEvents(){
        return this.events;
    }

    clean(){
        this.events = [];
    }
}
