"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthenticationModel_1 = require("../Model/AuthenticationModel");
const axios_1 = require("axios");
const Events_1 = require("../Events");
const queryString = require("query-string");
const authEndpoint = 'https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token';
const clientAuthorization = 'YmE0OTVhMjQtODE4Yy00NzJiLWIxMmQtZmYyMzFjMWI1NzQ1Om12YWlaa1JzQXNJMUlCa1k=';
class PlayStationAccount {
    constructor(accountData) {
        this._accountData = accountData;
    }
    static refreshTokenFormData(tokenData) {
        return {
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token,
            redirect_uri: 'https://remoteplay.dl.playstation.net/remoteplay/redirect',
            scope: tokenData.scope
        };
    }
    get data() {
        return this._accountData;
    }
    static login(info) {
        return new Promise((resolve, reject) => {
            let formData = {};
            if (typeof info === 'string') {
                formData = {
                    grant_type: 'authorization_code',
                    code: info,
                    redirect_uri: 'https://remoteplay.dl.playstation.net/remoteplay/redirect',
                };
            }
            else if (AuthenticationModel_1.isOAuthTokenResponse(info)) {
                formData = PlayStationAccount.refreshTokenFormData(info);
            }
            else {
                return reject(`Invalid argument type passed to login: ${typeof info}`);
            }
            axios_1.default.post('https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token', queryString.stringify(formData), {
                headers: {
                    'Authorization': `Basic ${clientAuthorization}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then((response) => {
                const accountData = response.data;
                Events_1.default.emit('logged-in', accountData);
                return resolve(new this(accountData));
            })
                .catch((err) => {
                Events_1.default.emit('login-failed', err);
                if (err.response) {
                    return reject(err.response.data);
                }
                return reject(err);
            });
        });
    }
    refresh() {
        return new Promise((resolve, reject) => {
            let formData = {};
            formData = PlayStationAccount.refreshTokenFormData(this.data);
            axios_1.default.post('https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token', queryString.stringify(formData), {
                headers: {
                    'Authorization': `Basic ${clientAuthorization}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then((response) => {
                this._accountData = response.data;
                Events_1.default.emit('tokens-refreshed', this._accountData);
                return resolve(this._accountData);
            })
                .catch((err) => {
                Events_1.default.emit('tokens-refresh-failed', err);
                if (err.response) {
                    return reject(err.response.data);
                }
                return reject(err);
            });
        });
    }
    profile() {
        return new Promise((resolve, reject) => {
            const accessToken = this.data.access_token;
            axios_1.default.get('https://us-prof.np.community.playstation.net/userProfile/v1/users/me/profile2?fields=onlineId,avatarUrls,plus,primaryOnlineStatus,presences(@titleInfo)&avatarSizes=m,xl&titleIconSize=s', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then((response) => {
                const responseBody = response.data;
                Events_1.default.emit('profile-data', responseBody.profile);
                return resolve(responseBody.profile);
            })
                .catch((err) => {
                Events_1.default.emit('profile-data-failed', err);
                if (err.response) {
                    return reject(err.response.data);
                }
                return reject(err);
            });
        });
    }
}
exports.default = PlayStationAccount;
//# sourceMappingURL=Account.js.map