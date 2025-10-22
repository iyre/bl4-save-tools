# Item Serials

Credit to [Nicnl & co.](https://github.com/Nicnl/borderlands4-serials) for item serial research. See that repo for excellent detail and examples on the decoding process. I refer to some key topics covered in that project like tokens and separators.


# Missing level field
The `Matador's Match` (from Gilded Glory DLC) has a static serial which does not include a level field. The game seems to default to level 1 in this case.

It's possible to insert the missing level field with a desired value. (I noticed this while comparing with another DLC weapon.)

The early section of the serial (up to the double hard separator `||`) contains a few notable fields:
- varint or varbit itemtype ID + soft separator
- varint `0` + soft sep (presumed to be padding)
- list of key/value fields. key & value are separated by soft sep `,`(01) and each pair is terminated by hard sep `|`(00)
  - 1: level
  - 2: price
  - 9: ??
  - ?? others
- section terminated by hard separator `|`(00)

The level field always appears immediately after the padding varint `0`. So, we can check whether the price field follows the padding `0` and insert our level between them.

Comparison of partial DLC serials for "First Impression" (level 50) with "Matador's Match" (original, then with level field inserted)
```
FirstImpression
00100 00  10010110 01     10000000 01 10010000 01 1000100111000 00 10001000 01 100010110001101010 00 00 <part data omitted>
      |      13    ,         0     ,     1     ,     50         |     2     ,     2698            |  |

MatadorsMatch (original)
00100 00 1001010110000 01 10000000 01                              10001000 01 100100111000101000 00 00 <part data omitted>
      |     21         ,     0     ,                                  2     ,    537             |  |

MatadorsMatch (with added level field)
00100 00 1001010110000 01 10000000 01 10010000 01 1000100111000 00 10001000 01 100100111000101000 00 00  <part data omitted>
      |     21         ,     0     ,     1     ,     50         |     2     ,     537             |  |
```

# State Flags
`state_flags` encode the labels you're able to attach to items.
- 1: Base
- 3: Favorite
- 5: Junk
- 9: Bank
- 17: Group 1
- 33: Group 2
- 65: Group 3
- 129: Group 4
- 257: ???
- 513: ???

