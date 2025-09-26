# Challenges
Challenges will be marked completed in-game if the related counter is at or above a threshold. Rewards are not granted based on counter state, but rather when the threashold is actually reached. Increasing counters will not automatically grant rewards. You can increase a counter to `threshold - 1`, then manually reach the threshold in-game to receive the reward normally. Rewards are added to `state` > `packages` in save YAML. Accepting that package in-game will add a data key elsewhere in the save YAML to actually unlock the item for use, remove the reward package, and add its key to `pips` > `pips_list` (i.e. mark as "read").

## Hoverdrive unlocks
- Weapon manufacturer challenges for total kills unlock hoverdrives.
- Each mfg has 5 hoverdrive challenge tiers.
- Simply increasing challenge counters in the save file will not automatically grant rewards for completed tiers.

Rather than dealing with the rewards system, you may simply add the relevant hoverdrive reward key to `state` > `unique_rewards` to unlock it for use without necessarily reaching mfg kill counts.

| Manufacturer | Tier | Kills | Reward Key                      |
|--------------|------|-------|---------------------------------|
| Daedalus     | 1    | 50    | `Reward_HoverDrive_Daedalus_01` |
| Daedalus     | 2    | 200   | `Reward_HoverDrive_Daedalus_02` |
| Daedalus     | 3    | 400   | `Reward_HoverDrive_Daedalus_03` |
| Daedalus     | 4    | 1000  | `Reward_HoverDrive_Daedalus_04` |
| Daedalus     | 5    | 2000  | `Reward_HoverDrive_Daedalus_05` |
| Jakobs       | 1    | 50    | `Reward_HoverDrive_Jakobs_01`   |
| Jakobs       | 2    | 200   | `Reward_HoverDrive_Jakobs_02`   |
| Jakobs       | 3    | 400   | `Reward_HoverDrive_Jakobs_03`   |
| Jakobs       | 4    | 1000  | `Reward_HoverDrive_Jakobs_04`   |
| Jakobs       | 5    | 2000  | `Reward_HoverDrive_Jakobs_05`   |
| Maliwan      | 1    | 50    | `Reward_HoverDrive_Maliwan_01`  |
| Maliwan      | 2    | 200   | `Reward_HoverDrive_Maliwan_02`  |
| Maliwan      | 3    | 400   | `Reward_HoverDrive_Maliwan_03`  |
| Maliwan      | 4    | 1000  | `Reward_HoverDrive_Maliwan_04`  |
| Maliwan      | 5    | 2000  | `Reward_HoverDrive_Maliwan_05`  |
| Order        | 1    | 50    | `Reward_HoverDrive_Order_01`    |
| Order        | 2    | 200   | `Reward_HoverDrive_Order_02`    |
| Order        | 3    | 450   | `Reward_HoverDrive_Order_03`    |
| Order        | 4    | 750   | `Reward_HoverDrive_Order_04`    |
| Order        | 5    | 1500  | `Reward_HoverDrive_Order_05`    |
| Ripper       | 1    | 50    | `Reward_HoverDrive_Borg_01`     |
| Ripper       | 2    | 150   | `Reward_HoverDrive_Borg_02`     |
| Ripper       | 3    | 300   | `Reward_HoverDrive_Borg_03`     |
| Ripper       | 4    | 600   | `Reward_HoverDrive_Borg_04`     |
| Ripper       | 5    | 1300  | `Reward_HoverDrive_Borg_05`     |
| Tediore      | 1    | 50    | `Reward_HoverDrive_Tediore_01`  |
| Tediore      | 2    | 200   | `Reward_HoverDrive_Tediore_02`  |
| Tediore      | 3    | 450   | `Reward_HoverDrive_Tediore_03`  |
| Tediore      | 4    | 750   | `Reward_HoverDrive_Tediore_04`  |
| Tediore      | 5    | 1500  | `Reward_HoverDrive_Tediore_05`  |
| Torgue       | 1    | 50    | `Reward_HoverDrive_Torgue_01`   |
| Torgue       | 2    | 150   | `Reward_HoverDrive_Torgue_02`   |
| Torgue       | 3    | 300   | `Reward_HoverDrive_Torgue_03`   |
| Torgue       | 4    | 600   | `Reward_HoverDrive_Torgue_04`   |
| Torgue       | 5    | 1300  | `Reward_HoverDrive_Torgue_05`   |
| Vladof       | 1    | 50    | `Reward_HoverDrive_Vladof_01`   |
| Vladof       | 2    | 200   | `Reward_HoverDrive_Vladof_02`   |
| Vladof       | 3    | 400   | `Reward_HoverDrive_Vladof_03`   |
| Vladof       | 4    | 1000  | `Reward_HoverDrive_Vladof_04`   |
| Vladof       | 5    | 2000  | `Reward_HoverDrive_Vladof_05`   |
