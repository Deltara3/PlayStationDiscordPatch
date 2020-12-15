"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayStationConsole_1 = require("./PlayStationConsole");
class PlayStationVita extends PlayStationConsole_1.PlayStationConsole {
    constructor() {
        super(PlayStationConsole_1.PlayStationConsoleType.PSVITA, '772576212782546975');
    }
    get assetName() {
        return 'vita_main';
    }
    get consoleName() {
        return 'PlayStation Vita';
    }
}
exports.default = PlayStationVita;
//# sourceMappingURL=PlayStationVita.js.map