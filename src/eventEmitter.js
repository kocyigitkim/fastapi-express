class EventEmitter{
    constructor(){
        this.actions = [];
    }
    /**
     * 
     * @param {Function} action 
     */
    addHandler(action){
        this.actions.push(action);
    }
    /**
     * 
     * @param {Function} action 
     */
    removeHandler(action){
        var remIndex = this.actions.indexOf(action);
        if(remIndex>-1){
            this.actions.splice(remIndex, 1);
        }
    }
    /**
     * 
     * @param {Array} args 
     */
    invoke(args){
        this.actions.forEach(action=>{
            if(action) action(...args);
        });
    }
}

module.exports = EventEmitter;