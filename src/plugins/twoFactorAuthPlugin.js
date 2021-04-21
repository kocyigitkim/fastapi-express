class TwoFactorAuthSession {
    constructor(ctx, session) {
        this.ctx = ctx;
        this.session = session;
    }
    set(data) {
        this.session.auth = { data: data, isLoggedIn: Boolean(data), validated: false };
    }
    validate() {
        this.session.auth = { ...this.session.auth, validated: true };
    }
    get() {
        return this.session.auth && this.session.auth.data;
    }
    reset() {
        if (this.session.auth) {
            delete this.session.auth;
        }
    }
    isLoggedIn() {
        return Boolean(this.session.auth && this.session.auth.isLoggedIn && this.session.auth.validated);
    }
}
class TwoFactorAuthPlugin {
    constructor(name = "auth") {
        this.name = name;
    }
    async getterMethod(ctx) {
        const session = ctx.session;
        return new TwoFactorAuthSession(ctx, session);
    }
}
module.exports = TwoFactorAuthPlugin;