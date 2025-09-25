# Borderlands 4 - Online Save Editor
Web-based tool for modifying Borderlands 4 (PC) save files.

## [Online Editor](https://iyre.github.io/bl4-save-tools/)

## Features
- Decrypt `.sav` file to human-readable YAML
- Export as re-encrypted `.sav` file or YAML
- Manually edit save YAML within the web page
- Apply pre-configured modifications
  - Remove map fog
  - Discover all locations
  - Unlock all safehouses
  - Re-calculate SDU points
  - Skip story missions
  - Unlock UVH mode

## Usage
1. Open the online editor linked above or clone the repo and open `index.html` in any web browser.
2. Select a `.sav` file (or `.yaml`) if you have one.
3. Enter your Steam or Epic ID - whichever one you license the game through.
   - These can be found on each platform's account setting website, or in the save file path for Steam.
   - Steam: https://store.steampowered.com/account/ (17 characters)
   - Epic: https://www.epicgames.com/account/personal/ (32 characters)
4. Click **Import** - This will decrypt the save and place the YAML text in the integrated editor.
5. **Export your original save as a backup.** Keep these timestamped files in case something goes wrong.
6. Edit your save as desired - refer to [docs](docs/README.md) for basic info about the structure
   - Use "Quick Modifications" to automatically apply common changes that are relatively safe & reliable. These are applied in the editor immediately when clicked. No undo button for now.
7. Download as `.sav`
8. Rename or delete your original save and replace it with the new one, removing the timestamp.
   - Recommended to keep a copy of the new save with the timestamp as a backup (in addition to the pre-edit backup).

You can safely replace saves while the game is running as long as a different character is selected.\
Modifying a save for a loaded character wont work as the save is in memory at that point and will overwrite the file on disk.\
Don't attempt to modify `profile.sav` while the game is running.

[Details/findings about save files](docs/README.md)

## Quick Modifications
These run JavaScript functions which apply specific edits to save files quickly and consistently.

- Remove map fog
  - Fully reveals the in-game map terrain (does not include POI markers)
  - Sets fog of war overlay for every map to 100% discovered - [technical details](docs/exploration.md)
- Discover all locations
  - Makes all point of interest (POI) markers visible on your map.
  - Adds a (reasonably complete) predefined list of locations to your existing list of discovered locations.
- Unlock all safehouses
  - Unlocks fast travel to all safehouses and silos
  - Completes all missions (activities) that unlock safehouses and silos (run SDU point re-calcualtion afterward)
  - This does not add POI markers.
- Re-calculate SDU points
  - Re-calculates available SDU points based on completed activities and found collectibles, updating the value in your save.
  - Will reset SDU purchases if total is lower than the sum of spent points (points are refunded)
  - Recommended after modifying activities (e.g. safehouses) or collectibles, which increment this total only when completed in-game.
- Skip story missions
  - Completes all missions related to the main story. Doesn't modify any other missions.
  - Functionally equivalent to starting a new save with the in-game story skip option. (Does not unlock that option)
- Unlock Ultimate Vault Hunter Mode
  - Sets values in the save to unlock UVHM 1-5. You can select any difficulty in-game.
  - Loading a save with this & story completion will enable starting at level 30 (flag is automatically added to `profile.sav`)
  - Doesn't complete any missions, so you could theoretically play the story from level 1 in UVHM difficulty

## Where Are My Saves?

**Windows:**
- Navigate to `%USERPROFILE%\Documents\My Games\Borderlands 4\Saved\SaveGames\`
  - Steam version will have a sub-folder with a 17-digit name - this is your steam ID which you'll need to encrypt/decrypt save files.
  - Navigate deeper like `.\<steam_id>\Profiles\client\`
- `1.sav`, `2.sav`, etc. files represent characters (import these with the editor)
- `profile.sav` contains global state such as black market inventory and bank contents. (the editor also works with this file)

## Acknowledgements
- Decryption functionality is based on https://github.com/glacierpiece/borderlands-4-save-utility
- This project was made possible through much coaching by LLM tools. I'm an amateur programmer.
- 
