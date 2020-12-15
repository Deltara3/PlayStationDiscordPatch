"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlayStationConsoleType;
(function (PlayStationConsoleType) {
    PlayStationConsoleType[PlayStationConsoleType["PS4"] = 0] = "PS4";
    PlayStationConsoleType[PlayStationConsoleType["PS3"] = 1] = "PS3";
    PlayStationConsoleType[PlayStationConsoleType["PSVITA"] = 2] = "PSVITA";
})(PlayStationConsoleType = exports.PlayStationConsoleType || (exports.PlayStationConsoleType = {}));
class PlayStationConsole {
    constructor(console, clientId) {
        this._console = console;
        this._clientId = clientId;
    }
    get clientId() {
        return this._clientId;
    }
    get type() {
        return this._console;
    }
}
exports.PlayStationConsole = PlayStationConsole;
//# sourceMappingURL=PlayStationConsole.js.map