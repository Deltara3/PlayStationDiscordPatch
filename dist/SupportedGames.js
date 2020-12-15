"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _store = require("electron-store");
const log = require("electron-log");
const axios_1 = require("axios");
class SupportedGames {
    constructor() {
        this.store = new _store({
            name: 'games',
        });
        const checksum = this.store.get('etag');
        const headers = {
            'User-Agent': 'PlayStationDiscord (https://github.com/Tustin/PlayStationDiscord)'
        };
        if (checksum) {
            headers['If-None-Match'] = checksum;
        }
        axios_1.default.get(`https://raw.githubusercontent.com/Tustin/PlayStationDiscord-Games/master/games.json?_=${Date.now()}`, {
            headers
        })
            .then((response) => {
            this.store.set('consoles', response.data);
            this.store.set('etag', response.headers.etag);
            log.info('Saved new version of games.json');
        })
            .catch((err) => {
            if (err.response.status === 304) {
                log.info('PlayStationDiscord-Games has not been updated, using cached version');
                return undefined;
            }
            log.error('Failed requesting games.json from the PlayStationDiscord-Games repo', err);
        });
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    get(presence) {
        return this.store.get('consoles.ps4').find((game) => {
            return (game.titleId.toLowerCase() === presence.npTitleId.toLowerCase()) || (game.name.toLowerCase() === presence.titleName.toLowerCase());
        });
    }
}
module.exports = SupportedGames.instance;
//# sourceMappingURL=SupportedGames.js.map