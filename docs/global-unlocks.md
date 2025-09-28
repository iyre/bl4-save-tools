# Global Unlocks (All Characters)
There are a few important unlocks stored in `profile.sav` under the `unlockables` key. These make certain features and shortcuts available to all of your character saves.

Example of the `unlockables` > `shared_progress` key in a profile save. (irrelevant keys omitted)
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
      unlockable_vehicles:
        entries:
          - Unlockable_Vehicles.Grazer
          - Unlockable_Vehicles.Paladin_Proto
          - Unlockable_Vehicles.mat47_jakobsuncommon
```


## Start At Level 30 With Story Completed
Completing the story by any means (and then loading the save) will add the `shared_progress.story_completed` flag to the `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the option to start new characters at level 30 in UVHM 1 (with all story missions completed).


## Specialization System
Completing the story and starting the post-game phase normally (i.e. not through save editing) will add the `shared_progress.epilogue_started` flag to `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the specialization system for **all** characters.

I'm not sure yet how to trigger this flag to be added automatically when a character save is loaded. Work around by manually adding it to the list, similar to the example under "Global Unlocks".


## Customizations
These unlock cosmetics, such as those rewarded from certain challenges, for all characters. Not every unlock is global.

`domains` > `local` > `unlockables`
- `unlockable_darksiren`
- `unlockable_exosoldier`
- `unlockable_gravatar`
- `unlockable_paladin`
- `unlockable_echo4`
- `unlockable_vehicles`
- `unlockable_weapons`

Each of those keys contains a further `entries` key, which contains an array of string unlock IDs.
