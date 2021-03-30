const moment = require('moment');

function transformType(value, fieldTypeDef, types) {
    if (!value) return null;

    var definition = {};
    if (typeof fieldTypeDef === "string") {
        definition.type = fieldTypeDef;
    } else {
        definition = fieldTypeDef;
    }
    return types[definition.type](value, definition);
}

function transformAuto(value, schema, types) {
    if (!value) return null;

    var result = { ...value };
    for (var k in value) {
        var v = value[k];
        var transformed = null;

        transformed = new Date(v);
        if (transformed.toString() === "Invalid Date") {
            transformed = null;
        }
        else {
            if (v.indexOf(":") > -1 || v.indexOf("-") > -1 || v.indexOf(".") > -1 || v.indexOf("/") > -1) {
                transformed = moment(transformed);
            } else {
                transformed = null;
            }
        }

        if (transformed === null) transformed = transformType(v, "number", types);
        if (transformed === null || isNaN(transformed)) transformed = transformType(v, "bool", types);
        if (transformed === null) transformed = transformType(v, "string", types);
        result[k] = transformed;
    }
    return result;
}

class ObjectTransformer {
    static types = {};
    constructor() {
    }
    static setType(type, transformAction) {
        ObjectTransformer.types[type] = transformAction;
    }
    static transform(value, schema) {
        if (schema === "auto" || !schema) {
            return transformAuto(value, schema, ObjectTransformer.types);
        }
        var result = { ...value };
        for (var k in schema) {
            if (result[k]) {
                result[k] = transformType(result[k], schema[k], ObjectTransformer.types);
            }
        }
        return result;
    }
}

ObjectTransformer.setType("number", (value) => {
    if (value.indexOf(".") > -1 || value.indexOf(",") > -1) return parseFloat(value);
    return parseInt(value);
});

ObjectTransformer.setType("string", (value) => {
    return value.toString();
});

ObjectTransformer.setType("bool", (value) => {
    if (typeof value === "string") value = value.toLowerCase();
    if (value === true || value === "true" || value === "on" || value === "1" ||
        value === false || value === "false" || value === "off" || value === "0") {
        return value === true || value === "true" || value === "on" || value === "1";
    }
    else {
        return null;
    }
});

ObjectTransformer.setType("datetime", (value, definition) => {
    try {
        var v = null;
        if (definition.format) {
            v = moment(value, definition.format);
        }
        else {
            v = moment(value);
        }
        if (v.isValid && v.isValid()) return v;
        return null;
    } catch { return null; }
});

module.exports = ObjectTransformer;