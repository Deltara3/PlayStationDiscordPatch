"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isOAuthTokenResponse(data) {
    const test = data;
    return test.access_token !== undefined;
}
exports.isOAuthTokenResponse = isOAuthTokenResponse;
//# sourceMappingURL=AuthenticationModel.js.map