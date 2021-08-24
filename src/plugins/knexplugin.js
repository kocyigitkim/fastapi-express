const knex = require('knex');

async function KnexStoredProcedure(name, args) {
    var objArgs = {};
    for (var arg of args) {
        objArgs[arg.name] = arg.value;
    }
    return (await this.raw(`exec ${name} ${args.map(arg => `:${arg.name}`).join(", ")}`, objArgs).catch(console.error)) || [];
}
async function KnexStoredProcedureJSON(name, args) {
    var response = (await this.raw(`exec ${name} ?`, JSON.stringify(args)).catch(console.error)) || [];
    return JSON.parse(response.map(item => Object.values(item)[0]).join(""));
}

class KnexPlugin {
    /**
     * 
     * @param {knex.Knex.Config} knexConfig 
     * @param {String} name 
     */
    constructor(knexConfig, name = "db") {
        this.name = name;
        this.knexConfig = knexConfig;
        this.db = knex(knexConfig);
        this.db.storedProcedure = KnexStoredProcedure.bind(this.db);
        this.db.storedProcedureJSON = KnexStoredProcedureJSON.bind(this.db);
    }
    getterMethod() {
        return this.db;
    }
}

module.exports = KnexPlugin;