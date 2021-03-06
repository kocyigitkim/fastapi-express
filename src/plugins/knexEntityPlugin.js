const { default: knex } = require('knex');
const KnexPlugin = require('./knexplugin');
const schemaLoader = require('knex-schema-loader');
class EntityPlugin {
    constructor(name = "entity", knexPluginName = "db") {
        this.name = name;
        this.knexPluginName = knexPluginName;
        this.schemas = {};
        this.knex = null;
        this.entityManagers = {};
    }
    setEncoder(encoderFunction) {
        this.encoderFunction = encoderFunction;
        return this;
    }
    setDecoder(decoderFunction) {
        this.decoderFunction = decoderFunction;
        return this;
    }
    setCoder(coder) {
        this.encoderFunction = coder.encode;
        this.decoderFunction = coder.decode;
        return this;
    }
    async getterMethod(ctx, entityName) {
        const knex = (ctx[this.knexPluginName])();
        if (!this.knex) this.knex = knex;
        try {
            if (!this.schemas[entityName]) {
                this.schemas[entityName] = await schemaLoader.getColumns(knex, entityName);
            }
        } catch (err) { console.error(err); }
        if (this.entityManagers[entityName]) return this.entityManagers[entityName];
        var entityManager = new EntityManager(knex, entityName, this.schemas[entityName], this.encoderFunction, this.decoderFunction);
        try {
            for (var entityField of Object.values(entityManager.schema)) {
                if (entityField.name.endsWith("Id") && entityField.name.length > 2) {
                    var subEntityName = entityField.name.substr(0, entityField.name.length - 2);
                    entityManager.subEntities.push({
                        name: subEntityName,
                        foreignKey: entityField.name,
                        key: 'Id',
                        manager: await this.getterMethod(ctx, subEntityName)
                    });
                }
            }
        } catch (err) { console.error(err); }
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
    constructor(db, entityName, schema, encoderFunction, decoderFunction) {
        const schemaValues = Object.values(schema);
        this.encoderFunction = encoderFunction || ((entity, data) => data);
        this.decoderFunction = decoderFunction || ((entity, data) => data);
        this.db = db;
        this.entityName = entityName;
        this.schema = schema;
        this.createDate = schema && schemaValues.filter(p => p.name == "CreateDate" || p.name == "createdon" || p.name == "CreatedDate" || p.name == "CreatedOn")[0];
        this.updateDate = schema && schemaValues.filter(p => p.name == "UpdateDate" || p.name == "modifiedon" || p.name == "updatedon" || p.name == "UpdateDate" || p.name == "ModifiedOn" || p.name == "UpdatedOn")[0];
        this.isDeleted = schema && schemaValues.filter(p => p.name == "IsDeleted" || p.name == "deleted" || p.name == "isdeleted")[0];
        this.isActive = schema && schemaValues.filter(p => p.name == "IsActive" || p.name == "IsActivated" || p.name == "isactivated" || p.name == "isactive")[0];
        this.primaryKey = schema && schemaValues.filter(p => p.name == entityName + "Id" || p.name == "Id")[0];
        this.subEntities = [];
    }
    processRecords(records) {
        if (!records) return [];

        const _this = this;
        return records.map(record => {
            for (var subEntity of _this.subEntities) {
                record[subEntity.name] = (async (subEntity, fkey) => {
                    return await subEntity.manager.findone(subEntity.key, fkey);
                }).bind(null, subEntity, record[subEntity.foreignKey]);
            }
            return _this.decoderFunction(_this, record);
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
        await this.db(this.entityName).insert(this.encoderFunction(this, entity)).then(p => { isSuccess = true; }).catch(err => {
            console.error(err);
            isSuccess = false;
        });
        return isSuccess;
    }
    async update(entity, where) {
        if (this.updateDate) {
            entity[this.updateDate.name] = new Date();
        }
        entity = { ...entity };

        var isSuccess = false;
        var pkey = entity[this.primaryKey.name];
        if (pkey) {
            delete entity[this.primaryKey.name];
        }
        else {
            return false;
        }
        var q = this.db(this.entityName);
        if (Boolean(where)) {
            q = q.where(where);
        }
        else {
            q = q.where(this.primaryKey.name, pkey);
        }
        await q.update(this.encoderFunction(this, entity)).then(p => { isSuccess = true; }).catch(err => {
            console.error(err);
            isSuccess = false;
        });
        return isSuccess;
    }
    async setActive(entity) {
        if (this.isActive) {
            var newEntity = {};
            newEntity[this.primaryKey.name] = entity[this.primaryKey.name];
            newEntity[this.isActive.name] = true;
            return await this.update(newEntity);
        }
        return false;
    }
    async setDeactive(entity) {
        if (this.isActive) {
            var newEntity = {};
            newEntity[this.primaryKey.name] = entity[this.primaryKey.name];
            newEntity[this.isActive.name] = false;
            return await this.update(newEntity);
        }
        return false;
    }
    async delete(entity) {
        if (this.isDeleted) {
            entity[this.isDeleted.name] = true;
            return this.update(entity);
        }
        else {
            var pkey = entity[this.primaryKey.name];
            var isSuccess = false;
            await this.db(this.entityName).where(this.primaryKey.name, pkey).del().then(p => { isSuccess = true }).catch(console.error);
            return isSuccess;
        }
    }
    async find(...args) {
        var q = this.db(this.entityName);
        if (args && args.length > 0) {
            q = q.where(...args);
        }
        return this.processRecords(await q.select().catch(console.error));
    }
    async findquery(query) {
        var q = this.db(this.entityName);
        if (query) {
            q = query(q, this);
        }
        return this.processRecords(await q.select().catch(console.error));
    }
    async findone(...args) {
        var q = this.db(this.entityName);
        if (args && args.length > 0) {
            q = q.where(...args);
        }
        return this.processRecords((await q.limit(1).select().catch(console.error) ?? []))[0];
    }
    async findonequery(query) {
        var q = this.db(this.entityName);
        if (query) {
            q = query(q, this);
        }
        return this.processRecords((await q.limit(1).select().catch(console.error) ?? []))[0];
    }
    /**
     * 
     * @param {String} name 
     * @param {{name: String,value:Object}[]} args 
     */
    async storedProcedure(name, args) {
        var objArgs = {};
        for (var arg of args) {
            objArgs[arg.name] = arg.value;
        }
        var result = (await this.db.raw(`exec ${name} ${args.map(arg => `:${arg.name}`).join(", ")}`, objArgs).catch(console.error)) || [];
        return this.processRecords(result);
    }
}

module.exports = EntityPlugin;
module.exports.EntityManager = EntityManager;