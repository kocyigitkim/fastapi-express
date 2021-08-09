const express = require("express");
const FastApi = require("./fastapi");
const objectTransformer = require("./objectTransformer");
class FastApiPluginContext {
  plugins = [];
  fileUploadPlugins = [];
  fileDownloadPlugins = [];
  middlewares = [];
}
module.exports.FastApiPluginContext = FastApiPluginContext;

const MiddleWareStatus = {
  Success: 0,
  Error: 1,
  Exit: 2,
};
module.exports.MiddleWareStatus = MiddleWareStatus;
class FastApiMiddleware {
  /**
   *
   * @param {MiddleWareStatus} status
   */
  constructor(status) {
    this.status = status;
  }
}
module.exports.FastApiMiddleware = FastApiMiddleware;
class FastApiPlugin {
  constructor(name, getterMethod, use) {
    this.name = name;
    this.getterMethod = getterMethod;
    this.use = use;
  }
}
module.exports.FastApiPlugin = FastApiPlugin;

class FastApiContext {
  constructor(initial) {
    /** @type {express.Request} */
    this.req = null;
    /** @type {express.Response} */
    this.res = null;
    /** @type {express.NextFunction} */
    this.next = null;
    /** @type {Object} */
    this.body = null;
    /** @type {Object} */
    this.session = null;
    /** @type {Boolean} */
    this.isGet = false;
    /** @type {Boolean} */
    this.isPost = false;
    /** @type {FastApiPluginContext} */
    this.apiContext = null;
    for (var k in initial) {
      this[k] = initial[k];
    }
  }
  /** @type {FastApi} */
  get app() {
    return this.apiContext.app;
  }
}
module.exports.FastApiContext = FastApiContext;

module.exports.FastApiResponse = class FastApiResponse {
  constructor(success, data, error) {
    this.success = success;
    this.data = data;
    this.error = error;
  }
};

function prepareAction(_this, action, isGet, disableAutoResponse = false, apiContext) {
  return async (req, res, next) => {
    const reqBody = { ...(req.body || {}), ...(req.query || {}) };
    apiContext = _this.apiContext;
    const args = new FastApiContext({
      req: req,
      res: res,
      next: next,
      body: reqBody,
      session: req.session,
      isGet: Boolean(isGet),
      isPost: !Boolean(isGet),
      apiContext: apiContext
    });

    args.transform = ((body, schema) => {
      return objectTransformer.transform(body, schema);
    }).bind(args, reqBody);

    var nexts = [];
    for (var plugin of apiContext.plugins) {
      if (plugin.isGetter && plugin.plugin.getterMethod) {
        args[plugin.name] = plugin.plugin.getterMethod.bind(plugin.plugin);
      } else {
        args[plugin.name] = plugin.plugin;
      }
      if (plugin.plugin && plugin.plugin.use) {
        nexts.push(plugin.plugin.use);
      }
    }
    try {
      for (var next of nexts) {
        var task_next = next(args);
        var result = task_next;
        if (task_next instanceof Promise)
          result = await task_next.catch(console.error);
        if (result instanceof FastApiMiddleware) {
          if (result.status == MiddleWareStatus.Exit) {
            return;
          } else if (result.status == MiddleWareStatus.Success) {
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    var _response = action.call(_this, args);
    var isPromise = _response instanceof Promise;
    try {
      if (isPromise) _response = await _response.catch(console.error);
    } catch { }
    if (!disableAutoResponse) {
      res.json(_response);
    }
  };
}

class FastApiRouter {
  constructor(controllerName, autoRegister = true) {
    this.controllerName = controllerName;
    this.router = express.Router();
    this.apiContext = null;
    if (autoRegister) {
      if (
        this.__proto__ &&
        this.__proto__.__proto__ &&
        this.__proto__.__proto__.register
      ) {
        this.__proto__.__proto__.register.call(this);
      } else {
        this.__proto__.register();
      }
    }
  }

  get(actionName, action) {
    this.router.get("/" + actionName, prepareAction(this, action, true, false, this.apiContext));
  }
  head(actionName, action) {
    this.router.head("/" + actionName, prepareAction(this, action, true, false, this.apiContext));
  }
  post(actionName, action) {
    this.router.post("/" + actionName, prepareAction(this, action, false, false, this.apiContext));
  }
  patch(actionName, action) {
    this.router.patch("/" + actionName, prepareAction(this, action, false, false, this.apiContext));
  }
  delete(actionName, action) {
    this.router.delete("/" + actionName, prepareAction(this, action, false, false, this.apiContext));
  }
  custom(actionName, action) {
    this.router.use("/" + actionName, prepareAction(this, action, null, true, this.apiContext));
  }
  register() {
    for (var key of Object.getOwnPropertyNames(this.__proto__)) {
      var value = this.__proto__[key];
      if (typeof value === "function" && key !== "constructor") {
        var methodDelimiterIndex = key.indexOf("_");
        var httpMethod = "get";
        var methodName = null;
        if (methodDelimiterIndex > -1) {
          httpMethod = key.substr(0, methodDelimiterIndex);
          methodName = key.substr(methodDelimiterIndex + 1);
        } else {
          methodName = key;
        }
        httpMethod = httpMethod.toLowerCase();
        var methodPathName = methodName.toLowerCase();
        this.__proto__.__proto__[httpMethod].call(this, methodPathName, value);
      }
    }
  }
  registerAction(key, action) {
    var methodDelimiterIndex = key.indexOf("_");
    var httpMethod = "get";
    var methodName = null;
    if (methodDelimiterIndex > -1) {
      httpMethod = key.substr(0, methodDelimiterIndex);
      methodName = key.substr(methodDelimiterIndex + 1);
    } else {
      methodName = key;
    }
    httpMethod = httpMethod.toLowerCase();
    var methodPathName = methodName.toLowerCase();
    this[httpMethod].call(this, methodPathName, action);
  }

  use(app) {
    app.use("/api/" + this.controllerName, this.router);
  }
  init(app) {
    this.apiContext = app.apiContext;
    return this;
  }
}

module.exports.FastApiRouter = FastApiRouter;
module.exports.FastApiPluginContext = FastApiPluginContext;
