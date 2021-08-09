const fastapi = require('./index').FastApi;
const api = new fastapi();
const PermissionPlugin = require('./src/plugins/permissionPlugin');
/*
const AuthPlugin = require('./src/plugins/authPlugin');
const TwoFactorAuthPlugin = require('./src/plugins/twoFactorAuthPlugin');
const KnexPlugin = require('./src/plugins/knexplugin');
const KnexEntityPlugin = require('./src/plugins/knexEntityPlugin');
*/

function accessGrantedAction(ctx, className, actionName){
    return className == "v2";
}

api.oninit.addHandler(() => {
    api.registerPlugin(new PermissionPlugin("permissions", accessGrantedAction));
    api.registerRouter("./example", __dirname);
    //api.registerFileUploadProvider();
    api.registerReact("/", "./example/reactexample", 3000);
});

api.run();