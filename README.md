# PlayStationDiscordPatch
Patch for [PlayStationDiscord](https://github.com/Tustin/PlayStationDiscord) which corrects invalid client identifiers.
Made for PS3/Vita users. All original code written by [Tustin](https://github.com/Tustin).

# Notice
- As the the patch requires version 3.1.2, PlayStation 5 rich presence and the showing of images is unsupported
- This is meant as a workaround for the new PSN api, once one is found, this repository most likely will be deleted.
- The inbetween installation is untested.

# Simple Installation
- Uninstall your current version of PlayStationDiscord if it does not match 3.1.2.
- Install PlayStationDiscord 3.1.2 from [here](https://github.com/Tustin/PlayStationDiscord/releases/tag/v3.1.2)
- If you have to reinstall, make sure to uncheck Launch PlayStationDiscord.
- Use a file browser to navigate to your install directory.
- Enter the resources folder and delete both app.asar and app-update.yml.
- Download app.asar from the releases of this repository or click [here](https://github.com/Deltara3/PlayStationDiscordPatch/releases/download/v1.0/app.asar)
- Copy the downloaded app.asar to the resources folder from before.
- Done! Launch the app and enjoy.

The below installation methods are for people who want to do something, for some reason.

# Inbetween Installation
Requires node.js, npm, and git to be installed.
- Uninstall your current version of PlayStationDiscord if it does not match 3.1.2.
- Install PlayStationDiscord 3.1.2 from [here](https://github.com/Tustin/PlayStationDiscord/releases/tag/v3.1.2)
- If you have to reinstall, make sure to uncheck Launch PlayStationDiscord.
- Use a file browser to navigate to your install directory.
- Enter the resources folder and delete app-update.yml.
- Open Command Prompt or Terminal and run "git clone https:/github.com/Deltara3/PlayStationDiscordPatch" to download the source.
- Run "npx asar pack PlayStationDiscordPatch app.asar" to pack the archive.
- Copy the newly created app.asar to the resources folder in your PlayStationDiscord install directory.
- Done! Launch the app and enjoy.

# Convoluted Installation
Requires node.js and npm to be installed.
- Uninstall your current version of PlayStationDiscord if it does not match 3.1.2.
- Install PlayStationDiscord 3.1.2 from [here](https://github.com/Tustin/PlayStationDiscord/releases/tag/v3.1.2)
- If you have to reinstall, make sure to uncheck Launch PlayStationDiscord.
- Use a file browser to navigate to your install directory.
- Enter the resources folder and delete app-update.yml.
- Copy app.asar to another location.
- Open Command Prompt or Terminal and navigate to that location mentioned before.
- Run the command "npx asar extract app.asar extracted" to extract the archive.
- Enter that folder with a file browser.
- Enter the dist folder and right after that enter Consoles.
- Use a text editor to edit PlayStation3.js and/or PlayStationVita.js
- Look for a long string of numbers.
- Replace the numbers in each one with the numbers below.
- PlayStation 3: 772576154267549717
- PlayStation Vita: 772576212782546975
- Delete, move, or rename the app.asar file in the location you extracted it from.
- Go back to Command Prompt or Terminal and run "npx asar pack extracted app.asar" to repack the archive.
- Finally, copy the newly created app.asar archive to the resources folder in your PlayStationDiscord install directory.
- Done! Launch the app and enjoy.
