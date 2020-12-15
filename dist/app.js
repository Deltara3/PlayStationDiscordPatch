"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const DiscordController_1 = require("./DiscordController");
const PlayStationConsole_1 = require("./Consoles/PlayStationConsole");
const electron_updater_1 = require("electron-updater");
const axios_1 = require("axios");
const PlayStation4_1 = require("./Consoles/PlayStation4");
const PlayStation3_1 = require("./Consoles/PlayStation3");
const PlayStationVita_1 = require("./Consoles/PlayStationVita");
const Events_1 = require("./Events");
const Account_1 = require("./PlayStation/Account");
const _store = require("electron-store");
const queryString = require("query-string");
const log = require("electron-log");
const url = require("url");
const path = require("path");
const isDev = process.env.NODE_ENV === 'dev';
const supportedGames = require('./SupportedGames');
const store = new _store();
const sonyLoginUrl = 'https://id.sonyentertainmentnetwork.com/signin/?service_entity=urn:service-entity:psn&response_type=code&client_id=ba495a24-818c-472b-b12d-ff231c1b5745&redirect_uri=https://remoteplay.dl.playstation.net/remoteplay/redirect&scope=psn:clientapp&request_locale=en_US&ui=pr&service_logo=ps&layout_type=popup&smcid=remoteplay&PlatformPrivacyWs1=exempt&error=login_required&error_code=4165&error_description=User+is+not+authenticated&no_captcha=false';
const logoIcon = electron_1.nativeImage.createFromPath(path.join(__dirname, '../assets/images/logo.png'));
const trayLogoIcon = electron_1.nativeImage.createFromPath(path.join(__dirname, '../assets/images/trayLogo.png'));
let mainWindow;
let loginWindow;
let playstationAccount;
let discordController;
let previousPresence;
let updateRichPresenceLoop;
let refreshAuthTokensLoop;
electron_updater_1.autoUpdater.autoDownload = false;
if (isDev) {
    log.transports.file.level = 'debug';
    log.transports.console.level = 'debug';
}
else {
    log.transports.file.level = 'info';
    log.transports.console.level = 'info';
}
const instanceLock = electron_1.app.requestSingleInstanceLock();
if (!instanceLock) {
    electron_1.app.quit();
}
axios_1.default.interceptors.request.use((request) => {
    log.debug('Firing axios request:', request);
    return request;
});
electron_1.app.setAppUserModelId('com.tustin.playstationdiscord');
function showMessageAndDie(message, detail) {
    electron_1.dialog.showMessageBox(null, {
        type: 'error',
        title: 'PlayStationDiscord Error',
        message,
        detail,
        icon: logoIcon
    });
    electron_1.app.quit();
}
function spawnLoginWindow() {
    loginWindow = new electron_1.BrowserWindow({
        width: 414,
        height: 743,
        minWidth: 414,
        minHeight: 763,
        icon: logoIcon,
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            plugins: true
        }
    });
    loginWindow.setMenu(null);
    loginWindow.on('closed', () => {
        loginWindow = null;
    });
    loginWindow.loadURL(sonyLoginUrl, {
        userAgent: 'Mozilla/5.0'
    });
    loginWindow.webContents.on('did-finish-load', () => {
        const browserUrl = loginWindow.webContents.getURL();
        if (browserUrl.startsWith('https://remoteplay.dl.playstation.net/remoteplay/redirect')) {
            const query = queryString.extract(browserUrl);
            const items = queryString.parse(query);
            if (!items.code) {
                log.error('Redirect URL was found but there was no code in the query string', items);
                showMessageAndDie('An error has occurred during the PSN login process. Please try again.', 'If the problem persists, please open an issue on the GitHub repo.');
                return;
            }
            Account_1.default.login(items.code)
                .then((account) => {
                playstationAccount = account;
                store.set('tokens', account.data);
                log.info('Saved oauth tokens');
                spawnMainWindow();
                loginWindow.close();
            })
                .catch((err) => {
                log.error('Unable to get PSN OAuth tokens', err);
                showMessageAndDie('An error has occurred during the PSN login process. Please try again.', 'If the problem persists, please open an issue on the GitHub repo.');
            });
        }
    });
}
function spawnMainWindow() {
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Show Application',
            click: () => mainWindow.show()
        },
        {
            label: 'Quit',
            click: () => {
                mainWindow.destroy();
                electron_1.app.quit();
            }
        }
    ]);
    const tray = new electron_1.Tray(trayLogoIcon);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('PlayStationDiscord');
    mainWindow = new electron_1.BrowserWindow({
        width: 512,
        height: 512,
        minWidth: 512,
        minHeight: 512,
        show: false,
        icon: logoIcon,
        backgroundColor: '#23272a',
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        title: 'PlayStationDiscord'
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.webContents.on('did-finish-load', () => {
        if (!isDev) {
            electron_updater_1.autoUpdater.checkForUpdates().catch((reason) => {
                log.error('Failed checking for update', reason);
            });
        }
        else {
            log.debug('Skipping update check because app is running in dev mode');
        }
        Events_1.default.emit('start-rich-presence');
    });
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.on('show', () => {
        if (process.platform === 'darwin') {
            electron_1.app.dock.show();
        }
    });
    mainWindow.on('minimize', () => {
        mainWindow.hide();
        if (process.platform === 'darwin') {
            electron_1.app.dock.hide();
        }
        if (electron_1.Notification.isSupported()) {
            let bodyText;
            if (process.platform === 'darwin') {
                bodyText = 'PlayStationDiscord is still running. You can restore it by clicking the icon in the menubar.';
            }
            else {
                bodyText = 'PlayStationDiscord is still running in the tray. You can restore it by double clicking the icon in the tray.';
            }
            const notification = new electron_1.Notification({
                title: 'Still Here!',
                body: bodyText,
                icon: logoIcon
            });
            notification.show();
        }
        else {
            log.warn('Tray notification not shown because notifications aren\'t supported on this platform', process.platform);
        }
        tray.on('double-click', () => {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    });
}
let richPresenceRetries;
let supportedTitleId;
function updateRichPresence() {
    playstationAccount.profile()
        .then((profile) => {
        if (profile.primaryOnlineStatus !== 'online') {
            if (discordController && discordController.running()) {
                discordController.stop();
                previousPresence = undefined;
                log.info('DiscordController stopped because the user is not online on PlayStation');
            }
            mainWindow.webContents.send('presence-data', {
                details: 'Offline'
            });
        }
        else if (profile.primaryOnlineStatus === 'online') {
            let discordRichPresenceData;
            let discordRichPresenceOptionsData;
            const presence = profile.presences[0];
            const platform = presence.platform;
            if (previousPresence === undefined || platform !== previousPresence.platform) {
                log.info('Switching console to ', platform);
                previousPresence = undefined;
                if (discordController) {
                    discordController.stop();
                    discordController = undefined;
                }
                const platformType = PlayStationConsole_1.PlayStationConsoleType[platform];
                if (platformType === undefined) {
                    log.error(`Unexpected platform type ${platform} was not found in PlayStationConsoleType`);
                    return showMessageAndDie(`An error occurred when trying to assign/switch PlayStation console.`);
                }
                const playstationConsole = getConsoleFromType(platformType);
                if (playstationConsole === undefined) {
                    log.error(`No suitable PlayStationConsole abstraction could be derived from platform type ${platformType}`);
                    return showMessageAndDie(`An error occurred when trying to assign/switch PlayStation console.`);
                }
                discordController = new DiscordController_1.DiscordController(playstationConsole);
                log.info('Switched console to', playstationConsole.consoleName);
            }
            if (previousPresence === undefined || previousPresence.npTitleId !== presence.npTitleId) {
                if (presence.npTitleId === undefined) {
                    discordRichPresenceData = {
                        details: 'Online',
                    };
                    discordRichPresenceOptionsData = {
                        hideTimestamp: true
                    };
                    log.info('Status set to online');
                }
                else {
                    discordRichPresenceData = {
                        details: presence.titleName,
                        state: presence.gameStatus,
                        startTimestamp: Date.now(),
                        largeImageText: presence.titleName
                    };
                    log.info('Game has switched', presence.titleName);
                    const discordFriendly = supportedGames.get(presence);
                    if (discordFriendly !== undefined) {
                        supportedTitleId = discordFriendly.titleId.toLowerCase();
                        discordRichPresenceData.largeImageKey = supportedTitleId;
                        log.info('Using game icon since it is supported');
                    }
                    else {
                        log.warn('Game icon not found in supported games store', presence.titleName, presence.npTitleId);
                        supportedTitleId = undefined;
                    }
                }
            }
            else if (previousPresence === undefined || previousPresence.gameStatus !== presence.gameStatus) {
                discordRichPresenceData = {
                    details: presence.titleName,
                    state: presence.gameStatus,
                    largeImageText: presence.titleName
                };
                if (supportedTitleId !== undefined) {
                    discordRichPresenceData.largeImageKey = supportedTitleId;
                }
                log.info('Game status has changed', presence.gameStatus);
            }
            if (discordRichPresenceData !== undefined && store.get('presenceEnabled', true)) {
                previousPresence = presence;
                discordController.update(discordRichPresenceData, discordRichPresenceOptionsData).then(() => {
                    log.info('Updated rich presence');
                    mainWindow.webContents.send('presence-data', discordRichPresenceData);
                }).catch((err) => {
                    log.error('Failed updating rich presence', err);
                });
            }
        }
        mainWindow.webContents.send('profile-data', profile);
        richPresenceRetries = 0;
    })
        .catch((err) => {
        log.error('Failed fetching PSN profile', err);
        if (++richPresenceRetries === 5) {
            updateRichPresenceLoop = stopTimer(updateRichPresenceLoop);
            log.error('Stopped rich presence loop because of too many retries without success');
        }
    });
}
function getConsoleFromType(type) {
    if (type === PlayStationConsole_1.PlayStationConsoleType.PS4) {
        return new PlayStation4_1.default();
    }
    if (type === PlayStationConsole_1.PlayStationConsoleType.PS3) {
        return new PlayStation3_1.default();
    }
    if (type === PlayStationConsole_1.PlayStationConsoleType.PSVITA) {
        return new PlayStationVita_1.default();
    }
    return undefined;
}
function stopTimer(timer) {
    clearInterval(timer);
    return undefined;
}
function signoutCleanup() {
    spawnLoginWindow();
    store.clear();
    refreshAuthTokensLoop = stopTimer(refreshAuthTokensLoop);
    updateRichPresenceLoop = stopTimer(updateRichPresenceLoop);
    mainWindow.close();
}
function toggleDiscordReconnect(toggle) {
    if (mainWindow) {
        mainWindow.webContents.send('toggle-discord-reconnect', toggle);
    }
}
function sendUpdateStatus(data) {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', data);
    }
}
Events_1.default.on('logged-in', () => {
    log.debug('logged-in event triggered');
    if (refreshAuthTokensLoop) {
        log.warn('logged-in was fired but refreshAuthTokensLoop is already running so nothing is being done');
        return;
    }
    log.info('Running refreshAuthTokensLoop');
    refreshAuthTokensLoop = setInterval(() => {
        playstationAccount.refresh()
            .then((data) => {
            store.set('tokens', data);
            log.info('Refreshed PSN OAuth tokens');
        })
            .catch((err) => {
            log.error('Failed refreshing PSN OAuth tokens', err);
        });
    }, 3599 * 1000);
});
Events_1.default.on('tokens-refresh-failed', (err) => {
    electron_1.dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'PlayStationDiscord Error',
        message: 'An error occurred while trying to refresh your authorization tokens. You will need to login again.',
        icon: logoIcon
    });
    signoutCleanup();
});
Events_1.default.on('start-rich-presence', () => {
    if (!updateRichPresenceLoop) {
        log.info('Starting rich presence loop');
        updateRichPresence();
        updateRichPresenceLoop = setInterval(updateRichPresence, 15000);
    }
});
Events_1.default.on('stop-rich-presence', () => {
    updateRichPresenceLoop = stopTimer(updateRichPresenceLoop);
    previousPresence = undefined;
    log.info('Stopped rich presence loop');
});
electron_1.ipcMain.on('toggle-presence', () => {
    const newValue = !store.get('presenceEnabled');
    store.set('presenceEnabled', newValue);
    if (!newValue && discordController) {
        Events_1.default.emit('stop-rich-presence');
        discordController.stop();
    }
    else {
        Events_1.default.emit('start-rich-presence');
    }
});
electron_1.ipcMain.on('signout', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = electron_1.dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: 'PlayStationDiscord Alert',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: 'Are you sure you want to sign out?',
        icon: logoIcon
    });
    if (response === 0) {
        signoutCleanup();
    }
}));
electron_updater_1.autoUpdater.on('download-progress', ({ percent }) => {
    sendUpdateStatus({
        message: `Downloading update ${Math.round(percent)}%`,
    });
});
electron_updater_1.autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({
        message: 'Checking for updates',
        icon: 'bars'
    });
});
electron_updater_1.autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({
        message: 'New update available',
        icons: 'success'
    });
    if (process.platform === 'darwin') {
        sendUpdateStatus({
            message: 'New update available. <u id="mac-download">Click here</u> to download!',
            icons: 'success'
        });
    }
    else {
        electron_updater_1.autoUpdater.downloadUpdate();
    }
});
electron_updater_1.autoUpdater.on('update-not-available', (info) => {
    sendUpdateStatus({
        message: 'Up to date!',
        fade: true,
        icon: 'success'
    });
});
electron_updater_1.autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus({
        message: 'Update downloaded. Please <u id="install">click here</u> to install - <u id="notes">Release Notes</u>',
        icon: 'success'
    });
});
electron_updater_1.autoUpdater.on('error', (err) => {
    log.error(err);
    sendUpdateStatus({
        message: 'Auto update failed!',
        icon: 'error'
    });
});
electron_1.ipcMain.on('update-install', () => {
    electron_updater_1.autoUpdater.quitAndInstall(true, true);
});
electron_1.ipcMain.on('show-notes', () => {
    electron_1.shell.openExternal('https://github.com/Tustin/PlayStationDiscord/releases/latest');
});
electron_1.ipcMain.on('mac-download', () => {
    electron_1.shell.openExternal('https://tusticles.com/PlayStationDiscord/');
});
electron_1.ipcMain.on('discord-reconnect', () => {
    log.info('Starting Discord reconnect');
    toggleDiscordReconnect(false);
    Events_1.default.emit('start-rich-presence');
});
Events_1.default.on('discord-disconnected', () => {
    log.warn('DiscordController disconnected');
    discordController = undefined;
    Events_1.default.emit('stop-rich-presence');
    toggleDiscordReconnect(true);
});
electron_1.app.on('second-instance', () => {
    if (!mainWindow) {
        return;
    }
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    return mainWindow.focus();
});
electron_1.app.on('ready', () => {
    if (process.platform === 'darwin') {
        electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate([
            {
                label: 'Application',
                submenu: [
                    { label: 'Quit', accelerator: 'Command+Q', click: () => electron_1.app.quit() }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' }
                ]
            }
        ]));
    }
    if (store.has('tokens')) {
        Account_1.default.login(store.get('tokens'))
            .then((account) => {
            playstationAccount = account;
            store.set('tokens', playstationAccount.data);
            log.info('Logged in with existing refresh token');
            spawnMainWindow();
        })
            .catch((err) => {
            log.error('Failed logging in with saved refresh token', err);
            spawnLoginWindow();
        });
    }
    else {
        spawnLoginWindow();
    }
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
//# sourceMappingURL=app.js.map