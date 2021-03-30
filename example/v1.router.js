const { FastApiRouter , FastApiContext } = require("../src/fastapirouter");

class Version1 extends FastApiRouter {
    constructor() {
        super("v1");
    }

    /**
     * 
     * @param {FastApiContext} ctx 
     */
    index(ctx) {
        //var body = ctx.transform();
        return null;
    }
    /**
     * 
     * @param {FastApiContext} ctx 
     * @returns 
     */
    custom_login(ctx){
        ctx.res.send("custom send");
    }
}

module.exports = Version1;