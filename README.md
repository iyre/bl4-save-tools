# Borderlands 4 - Online Save Editor
Web-based tool for modifying Borderlands 4 (PC) save files.

## [Online Editor](https://iyre.github.io/bl4-save-tools/)

## Features
- Decrypt `.sav` file to human-readable YAML
- Export as re-encrypted `.sav` file or YAML
- Manually edit save YAML within the web page
- Apply preset modifications to character saves
  - Max character level
  - Change class
  - Complete challenges
  - Unlock achievements
  - Unlock all specializations
  - Unlock UVHM & post-game activities
  - Complete story / side missions (base game, DLC, or both)
  - Complete activities by type (crawlers, safehouses, silos, etc.) or all at once
  - Add item serials to backpack
  - Set all items in backpack to character level
  - Enable / disable shared progression
  - Remove map fog & discover locations (used when shared progression is disabled)
- Apply preset modifications to profile saves (shared between characters)
  - Remove map fog
  - Discover locations
  - Unlock fast travel
  - Unlock vault doors & keys
  - Complete collectibles by type (echo logs, capsules, safes, etc.) or all at once (base game, DLC, or both)
  - Complete activities by type or all at once (shared progress)
  - Max SDU
  - Unlock vault powers
  - Unlock new game shortcuts
  - Unlock hover drives
  - Unlock cosmetics
  - Add item serials to bank
  - Set all items in bank to max level
- Remove mode to undo supported presets (missions, activities, map fog, locations, fast travel, vault doors & powers, collectibles)
- All DLC content through story pack 2 is included

I don't plan to implement item editing beyond basic preset manipulations.

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
   - Apply presets to automatically make common changes that are relatively safe & reliable. These are applied immediately when clicked.
   - Switch the presets panel to **Remove** to undo supported presets. The panel is outlined in red while remove mode is on. Hover a preset for details.
   - The YAML editor is shown by default. Click **Hide YAML** in the toolbar to give the presets the full width.
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
  - Ex. "Unlock collectibles" (character) will technically just "collect" them. You'd also need to apply "Discover locations" (profile) to have them shown on your map.
  - Ex. "Complete challenges" (character) will only set the appropriate counters. Most rewards are granted when you pass the threshold, so you'd also need to apply "Unlock cosmetics" (profile) to obtain them.

---
### Character
- **Max character level**
  - Sets character level to the maximum.
  - Sets expected skill points & XP.
- **Change class**
  - Changes the character class.
  - Refunds skill points.
- **Complete challenges**
  - Completes all counter-based challenges.
  - Does not complete activities or collectibles challenges. See "Complete all missions" and "Unlock collectibles".
  - Does not grant rewards for completion. [More info](docs/challenges.md)
  - Unlocks some achievements. (UVH 5 & world events confirmed)
- **Unlock achievements**
  - Also completes all activities (which are required for a few achievements).
  - Triggers platform achievements (Steam/Epic).
- **Unlock all specializations**
  - Unlocks the specialization system. [More info](docs/unlockables.md)
  - Sets maximum level and fully completes all trees.
- **Unlock UVHM & post-game activities**
  - Sets values in the save to unlock Ultimate Vault Hunter rank 1-5. You can switch between them in-game.
  - Completes the post-game tutorial mission which unlocks the **firmware system**, **Maurice's Black Market**, and **Moxxi's Big Encore**
  - Doesn't complete any other missions, so you could theoretically play the story from level 1 in UVHM difficulty which isn't otherwise possible.
  - Loading a save with this & story completion will enable starting at level 30 (flag is automatically added to `profile.sav`).
  - Completes all UVH challenges.
- **Missions** (Story / Side / Activity / All, with a Base Game / DLC / All switch)
  - Completes the selected missions. Doesn't modify any other missions.
  - Story includes each smaller DLC's main mission. Side includes vault and micro missions.
  - Completing base game story missions is functionally equivalent to starting a new save with the in-game story skip option (does not unlock that option), and enables the specialization system.
  - All missions (base game or all) also opens all vault doors.
  - In remove mode, the selected missions are removed from the save so they return to not started.
- **Add item serials to backpack**
  - Adds a user-provided list of serials into a character save (backpack).
- **Set all items in backpack to character level**
  - Updates all item serials in character inventory to match the level of the character.

### Profile
- **Remove map fog**
  - Fully reveals the in-game map terrain by setting fog of war overlay for every map to 100% discovered. [Technical details](docs/exploration.md)
  - Does not add PoI markers. See "Discover locations".
- **Discover locations**
  - Reveals all point of interest (PoI) markers on your map.
  - May trigger achievement for location discovery.
- **Unlock fast travel**
  - Unlocks fast travel to all safehouses and silos by completing related mission (activities).
  - Re-calculates SDU points, applying the new total if it's higher.
  - Unlocks safehouse, silo, and town PoI markers.
- **Collectibles** (Base Game / DLC / All)
  - Marks all* collectibles as found. ECHO logs, capsules, etc. (bobble heads aren't included)
  - Re-calculates SDU points, applying the new total if it's higher.
  - Does not add PoI markers. See "Discover locations".
- **Activities** (Base Game / DLC / All)
  - Marks activities complete on the profile, counting toward shared Echo token progress. Separate from character activity missions.
  - Re-calculates SDU points, applying the new total if it's higher.
- **Remove mode** supports re-adding map fog, un-discovering locations, locking fast travel, and removing collectibles / activities.
- **Max SDU**
  - Purchases all SDU upgrades, adding points if necessary.
- **Unlock vault powers**
  - Unlocks all vault powers normally granted by completing vaults.
- **Unlock new game shortcuts**
  - Enables starting new characters at level 30 with story already complete.
  - Enables the specialization system.
- **Unlock hover drives**
  - Unlocks all hover drive tiers and manufacturers.
  - Does not complete the associated kill count challenges. See "Complete challenges".
- **Unlock cosmetics**
  - Unlocks all cosmetic items, making them available to all characters.
- **Add item serials to bank**
  - Adds a user-provided list of serials into a profile save (bank).
- **Set all items in bank to max level**
  - Updates all item serials in bank to have max level.

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
- [RegularLunar](https://github.com/RegularLunar) for various features and enhancements.
- Item serial research via [Nicnl & co.](https://github.com/Nicnl/borderlands4-serials)
- This project was made possible through much coaching by LLM tools. I'm an amateur programmer.
