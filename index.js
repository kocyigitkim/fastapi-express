class ApiResponse{
    constructor(data, message = null){
        this.data = data;
        this.success = Boolean(data);
        this.message = message;
    }
    success(data){
        this.success = true;
        this.data = data;
        this.message = null;
        return this;
    }
    error(message){
        this.success = false;
        this.data = null;
        this.message = message;
        return this;
    }
}

module.exports = {
    FastApi: require('./src/fastapi'),
    FastApiRouter: require('./src/fastapirouter'),
    AuthPlugin: require('./src/plugins/authPlugin'),
    TwoFactorAuthPlugin: require('./src/plugins/twoFactorAuthPlugin'),
    KnexPlugin: require('./src/plugins/knexplugin'),
    KnexEntityPlugin: require('./src/plugins/knexEntityPlugin'),
    FastApiFileUpload: require('./src/fastapifileuploadprovider'),
    ApiResponse: ApiResponse
}