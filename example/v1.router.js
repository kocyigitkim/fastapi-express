const { FastApiRouter, FastApiContext } = require("../src/fastapirouter");

class Version1 extends FastApiRouter {
  constructor() {
    super("v1");
  }

  /**
   *
   * @param {FastApiContext} ctx
   */
  async index(ctx) {
      return 'yeahhhhh';
  }
  /**
   *
   * @param {FastApiContext} ctx
   */
  async test(ctx) {
    return "successfully";
  }
}

module.exports = Version1;
