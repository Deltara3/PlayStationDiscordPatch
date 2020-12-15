"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let discordClient;
const electron_1 = require("electron");
const log = require("electron-log");
const Events_1 = require("./Events");
const packageJson = require('../package.json');
class DiscordController {
    constructor(console) {
        this._running = false;
        this._defaultInfo = {
            instance: true,
            largeImageKey: 'ps4_main',
            largeImageText: 'PlayStation 4',
            smallImageKey: 'ps4_main',
            smallImageText: 'PlayStationDiscord ' + (packageJson.version || '')
        };
        this._currentConsole = console;
        discordClient = require('discord-rich-presence')(console.clientId);
        this._defaultInfo.largeImageKey = console.assetName;
        this._defaultInfo.largeImageText = console.consoleName;
        this._defaultInfo.smallImageKey = console.assetName;
        this._running = true;
        discordClient.on('error', (err) => {
            log.error('An error occurred while communicating with Discord', err);
            electron_1.dialog.showMessageBox(null, {
                type: 'error',
                title: 'PlayStationDiscord Error',
                message: 'An error occurred while communicating with Discord',
                detail: 'Please check the log file for additonal information.'
            });
            Events_1.default.emit('discord-disconnected', err);
            this._running = false;
        });
        log.info('DiscordController init');
    }
    restart() {
        this.stop();
        discordClient = new DiscordController(this._currentConsole);
    }
    running() {
        return this._running;
    }
    stop() {
        discordClient.disconnect();
        this._running = false;
    }
    update(data, options) {
        return new Promise((resolve, reject) => {
            if (!this.running()) {
                reject('Discord controller not running');
            }
            else {
                const usingOptions = options !== undefined;
                if (!usingOptions || !options.hideTimestamp) {
                    if (data.startTimestamp === undefined) {
                        data.startTimestamp = this._lastStartTimestamp;
                    }
                    else {
                        this._lastStartTimestamp = data.startTimestamp;
                    }
                }
                discordClient.updatePresence(Object.assign(Object.assign({}, this._defaultInfo), data));
                resolve();
            }
        });
    }
}
exports.DiscordController = DiscordController;
//# sourceMappingURL=DiscordController.js.map