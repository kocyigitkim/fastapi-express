const knex = require('knex').default;
const express = require('express');
const entityManager = require('./plugins/knexEntityPlugin').EntityManager;
class ApiResponse{
    constructor(data, message = null){
        this.data = data;
        this.success = Boolean(data);
        this.message = message;
    }
    setSuccess(data){
        this.success = true;
        this.data = data;
        this.message = null;
        return this;
    }
    setError(message){
        this.success = false;
        this.data = null;
        this.message = message;
        return this;
    }
}

/**
 * @class
 * @member {function(Object):Object} set
 * @member {function():Object} get
 * @member {function():Object} reset
 * @member {function():Boolean} isLoggedIn
*/
class FastApiAuthPlugin { }
/**
 * @class
 * @member {function(Object):Object} set
 * @member {function():Object} get
 * @member {function():Object} reset
 * @member {function():Object} validate
 * @member {function():Boolean} isLoggedIn
*/
class FastApiTwoFactorAuthPlugin { }

/**
 * @class
 * @member {Object} body
 * @member {Object} data_response
 * @member {express.Request} req
 * @member {express.Response} res
 * @member {express.NextFunction} next
 * @member {Boolean} isGet
 * @member {Boolean} isPost
 * @member {Object} session
 * @member {function(FastApiContext): knex} db
 * @member {function(FastApiContext, String): EntityManager} entity
 * @member {function(FastApiContext): FastApiAuthPlugin|FastApiTwoFactorAuthPlugin} auth
 */
class FastApiContext { }


module.exports = {
    FastApiAuthPlugin,
    FastApiContext,
    FastApiTwoFactorAuthPlugin,
    ApiResponse
};