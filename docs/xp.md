# Level XP Requirements
Figuring out functions to describe the level XP requirements with reasonable accuracy.

## Character Level Total XP Curve
```
Cubic MSE: 14474.473117242596 R^2: 0.9999999706709178
Cubic formula: XP = 22.616804 * level^3 + 287.021052 * level^2 + -1794.397382 * level + 5003.618448
Level 05:  +159.26
Level 06:   -40.78
Level 07:  -120.57
Level 08:  -109.41
Level 09:   -34.60
Level 10:  +126.55
Level 24:  +195.91
Level 25:    +6.41
Level 26:  -188.53
Level 44:    +5.75
```

3 important numbers for this research:
- **Level** - the level of the character.
- **Level-up XP** - the XP required to reach the next level. I catalog this under the level being reached.
- **Total XP** - the cummulative total of all XP earned (sum of all "level-up" values)

Data collections
- [Character XP](../data/xp_character.csv)
- [Specialization XP](../data/xp_specialization.csv)
- [Level curve function](../scripts/level_curve.py)

## Level-up (net) XP
Additional XP necessary to reach the next level

Ex.\
A character is level 24 with 441675 total XP points (find this near the top of the save file)\
They are at 1954/53192 for the next level-up (find this in-game under the Skills tab)\

From that we can calculate the required total XP for both level 24 and 25, plus we also have the net XP for `24->25`.
- 24: `439721 = 441675 - 1954`
- 25: `492913 = 441675 - 1954 + 53192`

We can systematically save-edit to inch upward through each total XP threshold.

Note: It seems like the first few levels (1-4 do not follow the same pattern, so I discard them when approximating the curve)

## How can we predect XP required for a given level?
To predict the XP required for a given level, we can fit a mathematical curve to the collected data points using NumPy’s polyfit function. This function finds the best-fitting polynomial (curve) of a specified degree for our data.

For example, a cubic polynomial (degree 3) has the form:

    XP = a * level³ + b * level² + c * level + d

By passing our level and XP data to np.polyfit(levels, xp, 3), we obtain the coefficients a, b, c, and d that best fit the actual XP requirements. We can then use this formula to estimate the total XP needed for any level, even those not explicitly listed in our data.

In practice:
1. We collect XP data for as many levels as possible.
2. We use polyfit to fit a cubic curve to this data.
3. The resulting formula allows us to predict XP requirements for any level with reasonable accuracy. 

Given the huge net XP requirement in higher levels, adding 1k to the estimate will still be well within the level.
