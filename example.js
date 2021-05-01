const fastapi = require('./index').FastApi;
const api = new fastapi();
/*
const AuthPlugin = require('./src/plugins/authPlugin');
const TwoFactorAuthPlugin = require('./src/plugins/twoFactorAuthPlugin');
const KnexPlugin = require('./src/plugins/knexplugin');
const KnexEntityPlugin = require('./src/plugins/knexEntityPlugin');
*/

api.oninit.addHandler((api, app) => {
    api.registerRouter("./example", __dirname);
    //api.registerFileUploadProvider();
    api.registerReact("/", "./example/reactexample");
});

api.run();