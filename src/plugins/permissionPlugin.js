const router = require("../fastapirouter");
class PermissionPlugin {
  constructor(sessionName, accessGrantAction, accessDeniedAction) {
    this.name = "permission";
    this.sessionName = sessionName;
    this.use = this.use.bind(this);
    if (!accessDeniedAction) {
      accessDeniedAction = (ctx) => {
        return { success: false, message: "ACCESS_DENIED", data: null };
      };
    }
    this.accessGrantAction = accessGrantAction;
    this.accessDeniedAction = accessDeniedAction;
  }
  async use(ctx) {
    const user_permissions = ctx.session[this.sessionName];
    const accessGrantAction = this.accessGrantAction;
    const urlParts = ctx.req.baseUrl.split("/");
    const pathParts = ctx.req.url.split("/");
    const className = urlParts[urlParts.length - 1];
    const actionName = pathParts[pathParts.length - 1];

    if (accessGrantAction) {
      var result = accessGrantAction(ctx, className, actionName);
      if (result) {
        return new router.FastApiMiddleware(router.MiddleWareStatus.Success);
      }
    }
    if (user_permissions) {
      const grantedCount = user_permissions.filter((up) => {
        const upParts = up.split(".");
        const upClassName = upParts[0];
        const upActionName = upParts[1];
        return (
          (upClassName == className && upActionName == actionName) ||
          (upClassName == className && upActionName == "*")
        );
      });
      if (grantedCount.length > 0) {
        return new router.FastApiMiddleware(router.MiddleWareStatus.Success);
      }
    }

    var accessDeniedResponse = this.accessDeniedAction(ctx);
    if (accessDeniedResponse instanceof Promise)
      await accessDeniedResponse.catch(console.error);
    ctx.res.json(accessDeniedResponse);
    return new router.FastApiMiddleware(router.MiddleWareStatus.Exit);
  }
}

module.exports = PermissionPlugin;
