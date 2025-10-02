# Borderlands 4 - Online Save Editor
Web-based tool for modifying Borderlands 4 (PC) save files.

## [Online Editor](https://iyre.github.io/bl4-save-tools/)

## Features
- Decrypt `.sav` file to human-readable YAML
- Export as re-encrypted `.sav` file or YAML
- Manually edit save YAML within the web page
- Apply preset modifications
  - Remove map fog
  - Discover all locations
  - Unlock all safehouses
  - Unlock all collectibles
  - Unlock all vault powers
  - Unlock all hover drives
  - Unlock all specializations
  - Skip story missions
  - Skip all missions
  - Unlock UVHM
  - Unlock new game shortcuts - `profile.sav`
  - Unlock all cosmetics - `profile.sav`

I don't plan to implement any sort of item editing.

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
   - Apply presets to automatically make common changes that are relatively safe & reliable. These are applied in the editor immediately when clicked. No undo button for now.
7. Download as `.sav`
8. Rename or delete your original save and replace it with the new one, removing the timestamp.
   - Recommended to keep a copy of the new save with the timestamp as a backup (in addition to the pre-edit backup).

**Notes:**
- Consider disabling cloud backups for the game to prevent save files from being reverted in some situations.
- You can safely replace saves while the game is running as long as a different character is selected.
- Modifying a save for a loaded character wont work as the save is in memory at that point and will overwrite the file on disk.
- Don't attempt to modify `profile.sav` while the game is running for the above reason.

## Preset Details
These run JavaScript functions which apply pre-configured edits to save files quickly and consistently.

- You can apply as many presets as you want.
- They update the YAML text you see in the editor.
- They're intended to be modular, so you may need to run a few to get the desired effect.
  - Example: "Unlock all collectibles" will technically just "collect" them. You'd also need to apply "Discover all locations" to have them shown on your map. 

---
### Character Presets
- **Remove map fog**
  - Fully reveals the in-game map terrain by setting fog of war overlay for every map to 100% discovered. [Technical details](docs/exploration.md)
  - Does not add PoI markers. See "Discover all locations".
- **Discover all locations**
  - Reveals all point of interest (PoI) markers on your map.
- **Unlock all safehouses**
  - Unlocks fast travel to all safehouses and silos by completing related mission (activities).
  - Re-calculates SDU points, applying the new total if it's higher.
  - Does not add PoI markers. See "Discover all locations".
- **Unlock all collectibles**
  - Marks all* collectibles as found. ECHO logs, capsules, etc. (bobble heads aren't included)
  - Re-calculates SDU points, applying the new total if it's higher.
  - Does not add PoI markers. See "Discover all locations".
- **Unlock all vault powers**
  - Unlocks all vault poweres normally granted by completing vaults.
  - Included in "Unlock all collectibles".
- **Unlock all hover drives**
  - Unlocks all hover drive tiers and manufacturers.
  - Does not complete the associated kill count challenges. [More info](docs/challenges.md)
- **Unlock all specializations**
  - Unlocks the specialization system. [More info](docs/unlockables.md)
  - Fully completes all trees.
- **Skip story missions**
  - Completes all missions related to the main story. Doesn't modify any other missions.
  - Functionally equivalent to starting a new save with the in-game story skip option. (Does not unlock that option)
  - Enables the specialization system.
- **Skip all missions**
  - Completes all missions including the main story, vaults, and activities like drill sites.
  - Enables the specialization system.
  - Re-calculates SDU points, applying the new total if it's higher.
- **Unlock UVHM** (Ultimate Vault Hunter Mode, i.e. post-game)
  - Sets values in the save to unlock UVHM 1-5. You can select any difficulty in-game.
  - Loading a save with this & story completion will enable starting at level 30 (flag is automatically added to `profile.sav`).
  - Doesn't complete any missions, so you could theoretically play the story from level 1 in UVHM difficulty which isn't otherwise possible.

### Profile Presets `profile.sav`
- **Unlock new game shortcuts**
  - Enables starting new characters at level 30 with story already complete.
  - Enables the specialization system.
- **Unlock all cosmetics**
  - Unlocks all cosmetic items, making them available to all characters.

## Where Are My Saves?
**Windows:**
- Navigate to `%USERPROFILE%\Documents\My Games\Borderlands 4\Saved\SaveGames\`
  - Steam version will have a sub-folder with a 17-digit name - this is your steam ID which you'll need to encrypt/decrypt save files.
  - Navigate deeper like `.\<steam_id>\Profiles\client\`
- `1.sav`, `2.sav`, etc. files represent characters (import these with the editor)
- `profile.sav` contains global state such as black market inventory and bank contents. (the editor also works with this file)

## Contributing
Please feel free to submit a pull request!

Please reach out on Discord if you'd like to discuss this project! (link in profile)

## Acknowledgements
- Decryption functionality largely based on https://github.com/glacierpiece/borderlands-4-save-utility
- Epic ID key derivation based on https://github.com/mi5hmash/Borderlands4SaveDataResigner
- Examples of 100% saves from Bytelocker ([Nexus Mods page](https://www.nexusmods.com/borderlands4/mods/84))
- [RegularLunar](https://github.com/RegularLunar) for specializations presets
- This project was made possible through much coaching by LLM tools. I'm an amateur programmer.
