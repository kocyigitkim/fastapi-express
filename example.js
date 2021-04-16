const fastapi = require('./src/fastapi');
const api = new fastapi();

api.oninit.addHandler((api, app) => {
    api.registerRouter("./example", __dirname);
});

api.run();