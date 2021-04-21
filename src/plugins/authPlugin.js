class AuthSession{
    constructor(ctx, session){
        this.ctx = ctx;
        this.session = session;
    }
    set(data){
        this.session.auth = data;
        this.session.isLoggedIn = Boolean(data);
    }
    get(){
        return this.session.auth;
    }
    reset(){
        if(this.session.auth){
            delete this.session.auth;
            delete this.session.isLoggedIn;
        }
    }
    isLoggedIn(){
        return Boolean(this.session.isLoggedIn);
    }
}
class AuthPlugin{
    constructor(name = "auth"){
        this.name = name;
    }
    async getterMethod(ctx){
        const session = ctx.session;
        return new AuthSession(ctx, session);
    }
}
module.exports = AuthPlugin;