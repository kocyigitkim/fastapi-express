const knex = require('knex');
class KnexPlugin{
    /**
     * 
     * @param {knex.Knex.Config} knexConfig 
     * @param {String} name 
     */
    constructor(knexConfig, name = "db"){
        this.name = name;
        this.knexConfig = knexConfig;
        this.db = knex(knexConfig);
    }
    getterMethod(){
        return this.db;
    }
}

module.exports = KnexPlugin;