const { FastApiRouter, FastApiContext } = require("../src/fastapirouter");
const fileuploadExpress = require('express-fileupload');

class FileUploadProvider {
    /**
     * 
     * @param {FileDescriptor[]} descriptor
     */
    async upload(descriptor) {

    }
}

class FileDescriptor {
    /**
     * 
     * @param {String} name 
     * @param {Function} mv 
     * @param {String} mimetype 
     * @param {Buffer} data 
     * @param {String} tempFilePath 
     * @param {Boolean} truncated 
     * @param {Number} size 
     * @param {String} md5 
     */
    constructor(name = null,
        mv = null,
        mimetype = null,
        data = null,
        tempFilePath = null,
        truncated = null,
        size = null,
        md5 = null) {
        this.name = name;
        this.mv = mv;
        this.mimetype = mimetype;
        this.data = data;
        this.tempFilePath = tempFilePath;
        this.truncated = truncated;
        this.size = size;
        this.md5 = md5;
    }
}
class FileOptions {
    /**
     * 
     * @param {Boolean} createParentPath 
     * @param {Boolean} uriDecodeFileNames 
     * @param {Boolean} safeFileNames 
     * @param {Boolean} preserveExtension 
     * @param {Boolean} abortOnLimit 
     * @param {Boolean} responseOnLimit 
     * @param {Boolean} limitHandler 
     * @param {Boolean} useTempFiles 
     * @param {String} tempFileDir 
     * @param {Boolean} parseNested 
     * @param {Boolean} debug 
     * @param {Number} uploadTimeout 
     * @param {Number} limits 
     */
    constructor(createParentPath = false,
        uriDecodeFileNames = false,
        safeFileNames = true,
        preserveExtension = false,
        abortOnLimit = false,
        responseOnLimit = null,
        limitHandler = false,
        useTempFiles = false,
        tempFileDir = null,
        parseNested = true,
        debug = false,
        uploadTimeout = 60000,
        limits = null) {
        this.createParentPath = createParentPath;
        this.uriDecodeFileNames = uriDecodeFileNames;
        this.safeFileNames = safeFileNames;
        this.preserveExtension = preserveExtension;
        this.abortOnLimit = abortOnLimit;
        this.responseOnLimit = responseOnLimit;
        this.limitHandler = limitHandler;
        this.useTempFiles = useTempFiles;
        this.tempFileDir = tempFileDir;
        this.parseNested = parseNested;
        this.debug = debug;
        this.uploadTimeout = uploadTimeout;
        this.limits = limits ? { fileSize: limits } : null;
    }
}

class FileUploadOptions {
    /**
     * 
     * @param {FileUploadProvider} provider 
     */
    constructor(provider) {
        this.provider = provider;
    }
}

class FileUploadRouter extends FastApiRouter {
    /**
     * 
     * @param {FileUploadOptions} options 
     */
    constructor(options) {
        super("file");
        this.options = options;
        this.fupload = fileuploadExpress(options);
    }

    /**
     * 
     * @param {FastApiContext} ctx 
     * @returns 
     */
    custom_upload(ctx) {
        const response = { success: false, message: "Access denied" };
        if (ctx.req.files) {
            for (var file in ctx.req.files) {
                this.options.provider.upload(file && files.length > 0 ? file : [file]);
            }

        }
        ctx.res.json(response);
    }
}

module.exports = FileUploadRouter;
module.exports.FileUploadProvider = FileUploadProvider;
module.exports.FileUploadOptions = FileUploadOptions;
module.exports.FileOptions = FileOptions;