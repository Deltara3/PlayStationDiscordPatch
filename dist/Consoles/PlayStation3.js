"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayStationConsole_1 = require("./PlayStationConsole");
class PlayStation3 extends PlayStationConsole_1.PlayStationConsole {
    constructor() {
        super(PlayStationConsole_1.PlayStationConsoleType.PS3, '772576154267549717');
    }
    get assetName() {
        return 'ps3_main';
    }
    get consoleName() {
        return 'PlayStation 3';
    }
}
exports.default = PlayStation3;
//# sourceMappingURL=PlayStation3.js.map