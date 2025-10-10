# Maurice's Black Market
This special vending machine sells legendary gear. It is locked by a cooldown timer (30 min) after either an item is purchased or the interface is closed.
- Inventory is limited 2 items, each with 4 different random rolls.
- Random rolls of inventory items are reset each time the machine is accessed.
- Items are the same for all _characters_.
- Items are different for each _player_, so another lobby will have a different inventory which you can access by joining.
- The machine changes locations every week upon the weekly reset.
- The location is the same for all players.

## Inventory
The machine's 2 items are chosen when the game is launched for the first time following a weekly reset. They're saved in `profile.sav`.
```yaml
# profile.sav
domains:
  local:
    shared:
      blackmarket_items:
        - blackmarket_itemtype: jak_repair_kit # type of item
          blackmarket_itemcomp: jak_repair_kit.comp_05_legendary_Defibrillator # specific item in stock
          blackmarket_gamestage: 50 # level of last character who approached a machine
        - blackmarket_itemtype: ORD_PS
          blackmarket_itemcomp: ORD_PS.comp_05_legendary_RocketReload # uses internal item names. "RocketReload" -> "Lucky Clover"
          blackmarket_gamestage: 50
```

Removing the entire `blackmarket_items` key will cause a new random inventory to be chosen and saved next time you launch the game.

The items may also be replaced with known item IDs. I've recorded most Black Market item IDs in [black_market.csv](../data/black_market.csv).\
If more than 2 items are present in the list, only the first 2 will be available.

**_Note that `profile.sav` can only be edited while the game is closed (not running), otherwise any changes will be overwritten._**

## Cooldown
Purchasing from or closing the black market will start a 30 minute cooldown/lockout before the machine can be accessed again (with new random rolls). This cooldown is tracked in your character save under `state` > `blackmarket_cooldown`. The value is the time when you will be able to purchase again as a unix epoch timestamp (number of seconds since 1970-01-01), e.g. `1760072589`. This key can be deleted or the value set to zero to temporarily disable the cooldown for that character.
