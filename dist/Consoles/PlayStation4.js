"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayStationConsole_1 = require("./PlayStationConsole");
class PlayStation4 extends PlayStationConsole_1.PlayStationConsole {
    constructor() {
        super(PlayStationConsole_1.PlayStationConsoleType.PS4, '457775893746810880');
    }
    get assetName() {
        return 'ps4_main';
    }
    get consoleName() {
        return 'PlayStation 4';
    }
}
exports.default = PlayStation4;
//# sourceMappingURL=PlayStation4.js.map