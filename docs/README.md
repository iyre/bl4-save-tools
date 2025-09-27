# Borderlands 4 Save Files
_GearBox has historically shown a positive attitude toward the Borderlands modding community, and many players have enjoyed customizing their experience through save editing and mods. However, please use this information responsibly._

These are my personal findings through observation and experimentation while developing this tool. I'm not an expert.

- [Encryption & Compression](encryption.md)
- [Challenges & Rewards](challenges.md)
- [Exploration data](exploration.md)

## Files
Windows: `%USERPROFILE%\Documents\My Games\Borderlands 4\Saved\SaveGames\<STEAM_ID>\Profiles\client\`
- Numbered save files like `1.sav`, etc. contain character state.
- `profile.sav` contains global state such as Maurice inventory and bank contents.

## Character Data
Contains state related to individual player characters, such as experience level, mission progress, and challenge counters.

`1.sav`, `2.sav`, etc.

### Region names
Keys realted to regions use internal names which differ from localized names
- `grasslands` -> Fadefields
- `shatteredlands` -> Carcadia Burn
- `mountains` -> Terminus Range
- `city` -> Dominion

Sub-regions are referred to generically as `RegionA`, `RegionB`, etc.

### Interpreting YAML keys
- `state`
  - Character name and internal class ID, e.g. `DarkSiren`, `Exo`
  - `experience`
    - Character level & XP
    - Specialization level & XP
  - `inventory`
  - `currencies`
- `globals`
  - Max & current UVH level
- `progression`
  - Skill trees
  - SDU upgrades
  - `point_pool`
    - Skill point total
    - Specialization point total
    - Echo token total (for SDU unlocks)
- `missions` > `local_sets`
  - Contains flag & completion state for missions grouped into "missionsets" (i.e. quest chains)
  - Main story missionsets are prefixed like `missionset_main_`
  - Side missionsets: `missionset_side_` or `missionset_micro_` (for singular missions)
  - Zone activity missionsets: `missionset_zoneactivity_` (safehouses, drill sites, etc.)
- `pips` > `pips_list` - List of viewed notifications
- `stats`
  - `achievements` - Achievement progress counters
  - `challenge` - Challenge progress counters
  - `openworld`
    - `activities` - Automatically populated based on mission state. Only a subset of activities appear here.
    - `collectibles` - Authoritative tracking for collectibles progress
- `gbx_discovery_pc`
  - `foddatas` - Contains fog of war maps for each discovered world/level
  - `metrics`
    - `hasseenworldlist` - List of regions visited (e.g. Fadefields, Shattered Lands , etc.)
    - `hasseenregionlist` - List of sub-regions visited (e.g. "The Howl", a district of Fadefields)
- `gbx_discovery_pg` - Discovered points-of-interest - controls whether they are visible on the map
- `unlockables` > `unlockable_hoverdrives` > `entries` - List of unlocked hoverdrives

## Profile Data
Contains state that is shared between characters such as bank contents (item serials), Maurice inventory, and whether you've completed the story before (unlocking lvl 30 start).

`profile.sav`

- Preferences/settings configured in the start menu
- `domains` > `local`
  - `shared`
    - `inventory` > `items` > `bank` - Banked item serials
    - `blackmarket_items` - Current black market items
  - `unlockables`
    - `shared_progress` > `entries`
      - `shared_progress.vault_hunter_level` - UVH mode unlocked
      - `shared_progress.prologue_completed` - Prologue completed (enables skipping the prologue)
      - `shared_progress.epilogue_started` - Post-game started (enables specialization system)
      - `shared_progress.story_completed` - Story completed (enables level 30 start)
    - Cosmetics allowed to be unlocked
- `deep_freeze_pips` > `pips_list_deep_freeze`
  - `profile.DLC.preorder`
  - `profile.newgame.ultimatevaulthunter`
- `pips` > `pips_list` - List of unlocked universal skins


### Global Unlocks (All Characters) {#global-unlocks}
There are a few important unlocks stored in `profile.sav` under the `unlockables` > `shared_progress` key. These make certain features and shortcuts available to all of your character saves.

Example of the "shared progress" key in a profile save. (irrelevant keys omitted)
```yaml
domains:
  local:
    unlockables:
      shared_progress:
        entries:
          - shared_progress.vault_hunter_level
          - shared_progress.prologue_completed
          - shared_progress.epilogue_started
          - shared_progress.story_completed
```


#### Start At Level 30 With Story Completed
Completing the story by any means (and then loading the save) will add the `shared_progress.story_completed` flag to the `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the option to start new characters at level 30 in UVHM 1 (with all story missions completed).


#### Specialization System
Completing the story and starting the post-game phase normally (i.e. not through save editing) will add the `shared_progress.epilogue_started` flag to `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the specialization system for **all** characters.

I'm not sure yet how to trigger this flag to be added automatically when a character save is loaded. Work around by manually adding it to the list, similar to the example under "Global Unlocks".

