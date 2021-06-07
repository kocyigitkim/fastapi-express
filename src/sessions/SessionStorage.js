class SessionStorage{
    constructor(){
        this.store = {};
    }
    async get(id){
        return this.store[id];
    }
    async set(id, value){
        this.store[id] = value;
    }
}
module.exports = SessionStorage;