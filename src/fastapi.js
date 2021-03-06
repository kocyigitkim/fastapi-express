const fs = require('fs');
const path = require('path');
const fastapirouter = require('./fastapirouter');
const express = require('express');
const bodyparser = require('body-parser');
const express_session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const RedisStore = connectRedis(express_session);
const EventEmitter = require('./eventEmitter');
const nodereactserve = require('node-react-serve');
const { FileUploadProvider } = require('./fastapifileuploadprovider');
const FileUploadRouter = require('./fastapifileuploadprovider');


class FastApi {
    constructor() {
        this.port = process.env.PORT || 5000;
        this.app = express();
        this.redisConfig = null;
        this.redisEnabled = false;
        this.onlisten = new EventEmitter();
        this.oninit = new EventEmitter();
        this.fileUploadProvider = null;
        this.fileDownloadProvider = null;
        this.bodyParserConfig = null;
        this.sessionConfig = null;
        this.sessionEnabled = true;
        this.apiContext = new fastapirouter.FastApiPluginContext();
        this.apiContext.app = this;
    }
    /**
     * 
     * @param {express_session.SessionOptions} config 
     */
    setSession(config) {
        this.sessionConfig = config;
    }
    disableSession() {
        this.sessionEnabled = false;
    }
    /**
     * 
     * @param {express_session.SessionOptions} config 
     */
    setSession(config) {
        this.sessionConfig = config;
    }
    setBodyParser(config) {
        this.bodyParserConfig = config;
    }
    registerPlugin(plugin) {
        this.apiContext.plugins.push({
            name: plugin.name,
            plugin: plugin,
            isGetter: true,
        });
        return this;
    }
    registerPluginByObject(name, obj) {
        this.apiContext.plugins.push({ name: name, plugin: obj, isGetter: false });
        return this;
    }
    registerRouter(routerPath, basepath) {
        if (basepath) {
            routerPath = path.join(basepath, routerPath);
        }
        var files = recFindByExt(routerPath, "router.js");
        for (var file of files) {
            const definition = require(file);
            if (definition.default) {
                const _default = definition.default;
                (new _default()).init(this).use(this.app);
            }
            else {
                (new definition()).init(this).use(this.app);
            }
        }
        return this;
    }
    registerReact(basePath = "/", clientPath = "./client", port = 3000, disablePathReset = false) {
        nodereactserve(this.app, basePath, clientPath, port, true, disablePathReset);
        return this;
    }
    registerFileDownloadProvider(fileDownloadProvider) {
        this.fileDownloadProvider = fileDownloadProvider;
    }
    /**
     * 
     * @param {FileUploadProvider} fileUploadProvider 
     */
    registerFileUploadProvider(fileUploadProvider = null) {
        this.fileUploadProvider = !fileUploadProvider ? new FileUploadProvider() : fileUploadProvider;
        this.fileUploadRouter = new FileUploadRouter({ provider: this.fileUploadProvider });
        this.app.use(this.fileUploadRouter.fupload);
        this.fileUploadRouter.use(this.app);
    }
    async init() {
        this.app.use(bodyparser.json(this.bodyParserConfig));
        this.app.use(bodyparser.urlencoded(this.bodyParserConfig));
        this.app.use(bodyparser.text(this.bodyParserConfig));
        this.app.use(bodyparser.raw(this.bodyParserConfig));

        var config = {
            secret: 'fastapi',
            cookie: {
                secure: false,
                httpOnly: false,
                maxAge: 1000 * 60 * 60 * 24 // 24 Hours
            }
        };

        this.oninit.invoke([this, this.app]);
        if (this.sessionConfig) {
            config = { ...this.sessionConfig, secret: 'fastapi' };
        }
        if (this.redisEnabled) {
            config = { ...config, store: new RedisStore({ client: redis.createClient(this.redisConfig) }) };
        }
        if (this.sessionEnabled) {
            this.app.use(new express_session(config));
        }
        console.log('---------------------');
        console.log('Fast Api Init');
        console.log(`Port: ${this.port}`);
        if (this.redisEnabled) {
            console.log('Redis enabled');
        }
        if (fastapirouter.FastApiPluginContext.plugins && fastapirouter.FastApiPluginContext.plugins.length > 0) {
            console.log('Installed plugins:');
            console.log((fastapirouter.FastApiPluginContext.plugins || []).map(item => item.name).join(", "));
        } else {
            console.log('No plugin installed');
        }
        console.log('---------------------');
        return this;
    }
    async listen() {
        console.log('Fast Api Listen');
        var server = this.app.listen(this.port, (() => {
            this.onlisten.invoke([this, this.app]);
        }).bind(this));
        this.server = server;
        console.log('Server is up');
        console.log('---------------------');
        return this;
    }
    /**
     * 
     * @param {RedisStoreOptions} config 
     */
    assignRedis(config) {
        this.redisEnabled = true;
        this.redisConfig = config
    }
    assignPort(port) {
        this.port = port;
        return this;
    }
    async run() {
        await this.init().catch(console.error);
        await this.listen().catch(console.error);
    }
}


function recFindByExt(base, ext, files, result) {
    files = files || fs.readdirSync(base)
    result = result || []

    files.forEach(
        function (file) {
            var newbase = path.join(base, file)
            if (fs.statSync(newbase).isDirectory()) {
                result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result)
            }
            else {
                if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
                    result.push(newbase)
                }
            }
        }
    )
    return result
}

module.exports = FastApi;