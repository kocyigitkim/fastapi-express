const { default: knex } = require('knex');
const SchemaInspector = require('knex-schema-inspector');
const KnexPlugin = require('./knexplugin');

class EntityPlugin {
    constructor(name = "entity", knexPluginName = "db") {
        this.name = name;
        this.knexPluginName = knexPluginName;
        this.schemas = {};
        this.schemaInspector = null;
        this.knex = null;
        this.entityManagers = {};
    }
    async getterMethod(ctx, entityName) {
        const knex = (ctx[this.knexPluginName])();
        if (!this.knex) this.knex = knex;
        if (!this.SchemaInspector) {
            this.schemaInspector = SchemaInspector.default(knex);
        }
        if (!this.schemas[entityName]) {
            this.schemas[entityName] = await this.schemaInspector.columnInfo(entityName);
        }
        if(this.entityManagers[entityName]) return this.entityManagers[entityName];
        var entityManager = new EntityManager(knex, entityName, this.schemas[entityName]);
        for(var entityField of entityManager.schema){
            if(entityField.name.endsWith("Id") && entityField.name.length > 2){
                var subEntityName = entityField.name.substr(0,entityField.name.length-2);
                entityManager.subEntities.push({
                    name: subEntityName,
                    foreignKey: entityField.name,
                    key: 'Id',
                    manager: await this.getterMethod(ctx, subEntityName)
                });
            }
        }
        this.entityManagers[entityName] = entityManager;
        return entityManager;
    }
}

class EntityManager {
    /**
     * 
     * @param {knex} db 
     * @param {String} entityName 
     * @param {Array} schema
     */
    constructor(db, entityName, schema) {
        this.db = db;
        this.entityName = entityName;
        this.schema = schema;
        this.createDate = schema.filter(p => p.name == "CreateDate" || p.name == "createdon" || p.name == "CreatedDate" || p.name == "CreatedOn")[0];
        this.updateDate = schema.filter(p => p.name == "UpdateDate" || p.name == "modifiedon" || p.name == "updatedon" || p.name == "UpdateDate" || p.name == "ModifiedOn" || p.name == "UpdatedOn")[0];
        this.isDeleted = schema.filter(p => p.name == "IsDeleted" || p.name == "deleted" || p.name == "isdeleted")[0];
        this.isActive = schema.filter(p => p.name == "IsActive" || p.name == "IsActivated" || p.name == "isactivated" || p.name == "isactive")[0];
        this.primaryKey = schema.filter(p => p.name == schema + "Id" || p.name == "Id")[0];
        this.subEntities = [];
    }
    processRecords(records){
        if(!records) return [];
        
        const _this = this;
        return records.map(record=>{
            for(var subEntity of _this.subEntities){
                record[subEntity.name] = (async (subEntity, fkey)=>{
                    return await subEntity.manager.findone(subEntity.key, fkey);
                }).bind(null, subEntity, record[subEntity.foreignKey]);
            }
            return record;
        })
    }
    async create(entity) {
        if (this.createDate) {
            entity[this.createDate.name] = new Date();
        }
        if (this.isDeleted) {
            entity[this.isDeleted.name] = false;
        }
        var isSuccess = false;
        await this.db(this.entityName).insert(entity).then(p => { isSuccess = true; }).catch(err => {
            console.error(err);
            isSuccess = false;
        });
        return isSuccess;
    }
    async update(entity) {
        if (this.updateDate) {
            entity[this.updateDate.name] = new Date();
        }
        var isSuccess = false;
        var pkey = entity[this.primaryKey.name];
        if(pkey){
            delete entity[this.primaryKey.name];
        }
        else{
            return false;
        }
        await this.db(this.entityName).where(this.primaryKey.name, pkey).update(entity).then(p => { isSuccess = true; }).catch(err => {
            console.error(err);
            isSuccess = false;
        });
        return isSuccess;
    }
    async setActive(entity){
        if(this.isActive){
            var newEntity = {};
            newEntity[this.primaryKey.name] = entity[this.primaryKey.name];
            newEntity[this.isActive.name] = true;
            return await this.update(newEntity);
        }
        return false;
    }
    async setDeactive(entity){
        if(this.isActive){
            var newEntity = {};
            newEntity[this.primaryKey.name] = entity[this.primaryKey.name];
            newEntity[this.isActive.name] = false;
            return await this.update(newEntity);
        }
        return false;
    }
    async delete(entity){
        if(this.isDeleted){
            entity[this.isDeleted.name] = true;
            return this.update(entity);
        }
        else{
            var pkey = entity[this.primaryKey.name];
            var isSuccess = false;
            await this.db(this.entityName).where(this.primaryKey.name, pkey).del().then(p=>{isSuccess = true}).catch(console.error);
            return isSuccess;
        }
    }
    async find(...args){
        var q = this.db(this.entityName);
        if(args && args.length > 0){
            q = q.where(...args);
        }
        return this.processRecords(await q.select().catch(console.error));
    }
    async findquery(query){
        var q = this.db(this.entityName);
        if(query){
            q = query(q, this);
        }
        return this.processRecords(await q.select().catch(console.error));
    }
    async findone(...args){
        var q = this.db(this.entityName);
        if(args && args.length > 0){
            q = q.where(...args);
        }
        return this.processRecords((await q.limit(1).select().catch(console.error) ?? []))[0];
    }
    async findonequery(query){
        var q = this.db(this.entityName);
        if(query){
            q = query(q, this);
        }
        return this.processRecords((await q.limit(1).select().catch(console.error) ?? []))[0];
    }
}

module.exports = EntityPlugin;
module.exports.EntityManager = EntityManager;