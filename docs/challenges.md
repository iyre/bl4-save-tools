# Challenges
Challenges will be marked completed in-game if the related counter is at or above a threshold. Rewards are not granted based on counter state, but rather when the threashold is actually reached. Increasing counters will not automatically grant rewards. You can increase a counter to `threshold - 1`, then manually reach the threshold in-game to receive the reward normally. Rewards are added to `state` > `packages` in save YAML. Accepting that package in-game will add a data key elsewhere in the save YAML to actually unlock the item for use, remove the reward package, and add its key to `pips` > `pips_list` (**<!>** UI notifications).

[Challenge Counters](../data/challenge_counters.csv)

## Rewards
Example reward package entry - this is the package reward for the "Kairos Speaks" challenge (finding 156/156 ECHO logs).
Claiming a cosmetic package reward in-game will will typically add the reward ID to `profile.sav` fo use on any character. Hover drives are an exception to that - they're added to the character save instead. Characters that claim the reward may also have the reward ID added to `state` > `unique_rewards` (which doesn't seem important)

For the **DECO-4** ECHO-4 body
- Reward ID: `RewardPackage_EchoBody_02_Order` (claimed in the character)
- Unlockable ID: `Unlockable_Echo4.body02_order` (added to global save)

Adding this exact object in the packages array will allow the reward to be claimed in-game, at which point it will be unlocked for all characters if appropriate (or, presumably just the claimer if not).
```yaml
# 1.sav (character save)
state:
  packages:
    - time_received: 1759129953 # seconds since unix epoch (1970-01-01T00:00:00Z)
      game_stage: 4 # character level when the package was received
      reward_scale: 1
      rewards_def: RewardPackage_EchoBody_02_Order # ID of the reward
      source: None
      viewed: false
```

These `rewards_def` IDs are similar to the ones added to `profile.sav`, but not exactly the same. Names of each type of reward and unlockable ID seem consistent and similar, so we can probably infer the package reward `rewards_def` value for a given reward if we know the unlockable ID stored in `profile.sav`.

Some package rewards contain both


## ECHO Logs
All _collectible_ ECHO logs that count toward Kairos Speaks are included in [collectibles.yaml](../data/collectibles.yaml).\
This includes 2 logs that are currently only obtainable via a UVH new game (presumably due to some sort of bug) or save editing.
- `city_mis_01` (Zadra Last Log)
- `city_mis_16` (Maurice's Log)

Replayable ECHO logs may also be attached to other collectibles such as Dead Bolts and Evocarium puzzles (see below).

The ECHO collectible keys follow a naming pattern and there are a few gaps in the numbering. None of these "missing" IDs correlate with a real ECHO. They don't advance the total in-game under `Inventory > ECHO Logs`. I imagine they may have been cut from the game at some point.
- `city_gen_20`
- `elp_gen_02`
- `elp_gen_05`
- `gra_gen_08`
- `gra_gen_25`
- `mtn_mis_01`
- `mtn_mis_02`
- `mtn_mis_03`

### Eridian (Nyriad) Logs
These are unlocked by completing the 18 collectible Evocarium puzzles.\
This progress is encoded separately from the actual collectible to ensure you hear the ECHO recordings in the correct order.

The `state.seen_eridium_logs` key has a binary counter value that is incremented with each completed puzzle. This controls which Eridian ECHO log is played when you collect the puzzle and which you're able to replay from the inventory. The key is created when the first puzzle is completed.

A value of `262143` will unlock all 18 logs - literally 18x binary 1s.

## Hoverdrive unlocks
- Weapon manufacturer challenges for total kills unlock hoverdrives.
- Each mfg has 5 hoverdrive challenge tiers.
- Simply increasing challenge counters in the save file will not automatically grant rewards for completed tiers.
- When a challenge reward is claimed, the hoverdrive's "unlockable" key is added to `unlockables` > `unlockable_hoverdrives` > `entries`
  - The "reward" key is moved to `state` > `unique_rewards` (doesn't seem important)
  - Adding the "unlockable" key directly to the unlockables array will unlock a hoverdrive for use without requiring mfg kill counts.

| Manufacturer | Tier | Kills | Reward Key                      | Unlockable Key                       |
|--------------|------|-------|---------------------------------|--------------------------------------|
| Daedalus     | 1    | 50    | `Reward_HoverDrive_Daedalus_01` | `unlockable_hoverdrives.Daedalus_01` |
| Daedalus     | 2    | 200   | `Reward_HoverDrive_Daedalus_02` | `unlockable_hoverdrives.Daedalus_02` |
| Daedalus     | 3    | 400   | `Reward_HoverDrive_Daedalus_03` | `unlockable_hoverdrives.Daedalus_03` |
| Daedalus     | 4    | 1000  | `Reward_HoverDrive_Daedalus_04` | `unlockable_hoverdrives.Daedalus_04` |
| Daedalus     | 5    | 2000  | `Reward_HoverDrive_Daedalus_05` | `unlockable_hoverdrives.Daedalus_05` |
| Jakobs       | 1    | 50    | `Reward_HoverDrive_Jakobs_01`   | `unlockable_hoverdrives.Jakobs_01`   |
| Jakobs       | 2    | 200   | `Reward_HoverDrive_Jakobs_02`   | `unlockable_hoverdrives.Jakobs_02`   |
| Jakobs       | 3    | 400   | `Reward_HoverDrive_Jakobs_03`   | `unlockable_hoverdrives.Jakobs_03`   |
| Jakobs       | 4    | 1000  | `Reward_HoverDrive_Jakobs_04`   | `unlockable_hoverdrives.Jakobs_04`   |
| Jakobs       | 5    | 2000  | `Reward_HoverDrive_Jakobs_05`   | `unlockable_hoverdrives.Jakobs_05`   |
| Maliwan      | 1    | 50    | `Reward_HoverDrive_Maliwan_01`  | `unlockable_hoverdrives.Maliwan_01`  |
| Maliwan      | 2    | 200   | `Reward_HoverDrive_Maliwan_02`  | `unlockable_hoverdrives.Maliwan_02`  |
| Maliwan      | 3    | 400   | `Reward_HoverDrive_Maliwan_03`  | `unlockable_hoverdrives.Maliwan_03`  |
| Maliwan      | 4    | 1000  | `Reward_HoverDrive_Maliwan_04`  | `unlockable_hoverdrives.Maliwan_04`  |
| Maliwan      | 5    | 2000  | `Reward_HoverDrive_Maliwan_05`  | `unlockable_hoverdrives.Maliwan_05`  |
| Order        | 1    | 50    | `Reward_HoverDrive_Order_01`    | `unlockable_hoverdrives.Order_01`    |
| Order        | 2    | 200   | `Reward_HoverDrive_Order_02`    | `unlockable_hoverdrives.Order_02`    |
| Order        | 3    | 450   | `Reward_HoverDrive_Order_03`    | `unlockable_hoverdrives.Order_03`    |
| Order        | 4    | 750   | `Reward_HoverDrive_Order_04`    | `unlockable_hoverdrives.Order_04`    |
| Order        | 5    | 1500  | `Reward_HoverDrive_Order_05`    | `unlockable_hoverdrives.Order_05`    |
| Ripper       | 1    | 50    | `Reward_HoverDrive_Borg_01`     | `unlockable_hoverdrives.Borg_01`     |
| Ripper       | 2    | 150   | `Reward_HoverDrive_Borg_02`     | `unlockable_hoverdrives.Borg_02`     |
| Ripper       | 3    | 300   | `Reward_HoverDrive_Borg_03`     | `unlockable_hoverdrives.Borg_03`     |
| Ripper       | 4    | 600   | `Reward_HoverDrive_Borg_04`     | `unlockable_hoverdrives.Borg_04`     |
| Ripper       | 5    | 1300  | `Reward_HoverDrive_Borg_05`     | `unlockable_hoverdrives.Borg_05`     |
| Tediore      | 1    | 50    | `Reward_HoverDrive_Tediore_01`  | `unlockable_hoverdrives.Tediore_01`  |
| Tediore      | 2    | 200   | `Reward_HoverDrive_Tediore_02`  | `unlockable_hoverdrives.Tediore_02`  |
| Tediore      | 3    | 450   | `Reward_HoverDrive_Tediore_03`  | `unlockable_hoverdrives.Tediore_03`  |
| Tediore      | 4    | 750   | `Reward_HoverDrive_Tediore_04`  | `unlockable_hoverdrives.Tediore_04`  |
| Tediore      | 5    | 1500  | `Reward_HoverDrive_Tediore_05`  | `unlockable_hoverdrives.Tediore_05`  |
| Torgue       | 1    | 50    | `Reward_HoverDrive_Torgue_01`   | `unlockable_hoverdrives.Torgue_01`   |
| Torgue       | 2    | 150   | `Reward_HoverDrive_Torgue_02`   | `unlockable_hoverdrives.Torgue_02`   |
| Torgue       | 3    | 300   | `Reward_HoverDrive_Torgue_03`   | `unlockable_hoverdrives.Torgue_03`   |
| Torgue       | 4    | 600   | `Reward_HoverDrive_Torgue_04`   | `unlockable_hoverdrives.Torgue_04`   |
| Torgue       | 5    | 1300  | `Reward_HoverDrive_Torgue_05`   | `unlockable_hoverdrives.Torgue_05`   |
| Vladof       | 1    | 50    | `Reward_HoverDrive_Vladof_01`   | `unlockable_hoverdrives.Vladof_01`   |
| Vladof       | 2    | 200   | `Reward_HoverDrive_Vladof_02`   | `unlockable_hoverdrives.Vladof_02`   |
| Vladof       | 3    | 400   | `Reward_HoverDrive_Vladof_03`   | `unlockable_hoverdrives.Vladof_03`   |
| Vladof       | 4    | 1000  | `Reward_HoverDrive_Vladof_04`   | `unlockable_hoverdrives.Vladof_04`   |
| Vladof       | 5    | 2000  | `Reward_HoverDrive_Vladof_05`   | `unlockable_hoverdrives.Vladof_05`   |
