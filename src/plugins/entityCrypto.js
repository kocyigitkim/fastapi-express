class EntityCrypto {
    constructor(schema, encrypt, decrypt) {
        this.schema = schema;
        this.encrypt = encrypt;
        this.decrypt = decrypt;
    }
    encode(entity, data) {
        const { entityName } = entity;
        if (this.schema) {
            const schema = this.schema[entityName];
            for (var k of schema) {
                data[k] = this.encrypt(data[k]);
            }
        }
        return data;
    }
    decode(entity, data) {
        const { entityName } = entity;
        if (this.schema) {
            const schema = this.schema[entityName];
            for (var k of schema) {
                data[k] = this.decrypt(data[k]);
            }
        }
        return data;
    }
}

module.exports = EntityCrypto;