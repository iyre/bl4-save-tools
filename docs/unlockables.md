# Global Unlockables (All Characters)
Game completion flags and cosmetic unlocks are stored in `profile.sav` under the `unlockables` key. They apply to all character saves.

[Extracted unlockables data](../data/unlockables.yaml)

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
          - Unlockable_Vehicles.Paladin_Proto # vehicle skin
          - Unlockable_Vehicles.mat47_jakobsuncommon # vehicle paintjob
```


## Start At Level 30 With Story Completed
Completing the story by any means (and then loading the save) will add the `shared_progress.story_completed` flag to the `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the option to start new characters at level 30 in UVHM 1 (with all story missions completed).


## Specialization System
Completing the story and starting the post-game phase normally (i.e. not through save editing) will add the `shared_progress.epilogue_started` flag to the `unlockables` > `shared_progress` > `entries` key in `profile.sav`. This enables the specialization system for **all** characters.

That flag is ONLY added when the state of the `missionset_main_cityepilogue` mission set is progressed in-game.

Replacing that missionset with this YAML content will immediately complete the mission next time the game is loaded. It's the state of the mission as the final objective is progressing from in-progress to completed.

```yaml
missions:
  local_sets:
    missionset_main_cityepilogue:
      missions:
        mission_main_cityepilogue:
          status: Active
          cursorposition: 8
          final:
            inv_openportal_endstate: completed
            phasedimensionentered_1st: true
            defeat_arjay_endstate: completed
            take_object_endstate: completed
          objectives:
            entervault:
              status: Completed_PostFinished
            defeat_arjay:
              status: Completed_PostFinished
            entervault_todefeatarjay:
              status: Deactivated_PostFinished
            explore_vault:
              status: Completed_PostFinished
            lootchests:
              status: Completed_PostFinished
              updatecount: 4
            returntomoxxisbar:
              status: Completed_Finishing
            speaktolilith:
              status: Completed_PostFinished
            take_object:
              status: Completed_PostFinished
            inv_readyforspeaktolilith:
              status: Completed_PostFinished
            _lootchests_sub3:
              status: Completed_PostFinished
            _lootchests_sub1:
              status: Completed_PostFinished
            _lootchests_sub2:
              status: Completed_PostFinished
            _lootchests_sub0:
              status: Completed_PostFinished
            inv_playerarrivedatfinalplatform:
              status: Completed_PostFinished
            inv_openportal:
              status: Completed_PostFinished
            inv_interactwithrift:
              status: Completed_PostFinished
```

## Cosmetics
These unlock cosmetics, such as those rewarded from challenges or story milestones, for all characters. Most unlocks are global, with the exception of [hover drives](challenges.md), which are per-character.

`domains` > `local` > `unlockables`
- `unlockable_darksiren`
- `unlockable_exosoldier`
- `unlockable_gravitar`
- `unlockable_paladin`
- `unlockable_echo4`
- `unlockable_vehicles`
- `unlockable_weapons`

Each of those keys contains a further `entries` key, which contains an array of string unlock IDs.
