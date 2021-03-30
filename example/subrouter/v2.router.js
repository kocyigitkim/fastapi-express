const { FastApiRouter , FastApiContext } = require("../../src/fastapirouter");

class Version2 extends FastApiRouter {
    constructor() {
        super("v2");
    }

    /**
     * 
     * @param {FastApiContext} ctx 
     */
    async get_Index(ctx) {
        console.log(ctx);
        
        return "Version 2";
    }
}

module.exports = Version2;