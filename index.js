

module.exports = {
    FastApi: require('./src/fastapi'),
    FastApiRouter: require('./src/fastapirouter'),
    AuthPlugin: require('./src/plugins/authPlugin'),
    TwoFactorAuthPlugin: require('./src/plugins/twoFactorAuthPlugin'),
    KnexPlugin: require('./src/plugins/knexplugin'),
    KnexEntityPlugin: require('./src/plugins/knexEntityPlugin'),
    FastApiFileUpload: require('./src/fastapifileuploadprovider'),
    JSDOC: { ...require('./src/JSDoc') },
    ApiResponse: require('./src/JSDoc').ApiResponse
}