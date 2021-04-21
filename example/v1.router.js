const { FastApiRouter , FastApiContext } = require("../src/fastapirouter");

class Version1 extends FastApiRouter {
    constructor() {
        super("v1");
    }

    /**
     * 
     * @param {FastApiContext} ctx 
     */
    async index(ctx) {
        const user = await ctx.entity(ctx, "User");
        
        
    }
    
}

module.exports = Version1;