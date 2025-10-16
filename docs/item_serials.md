# Item Serials

ex. ``@Uge8Cmm/)}}$pj+IrVgrus?-aE3Wxfg>Sa(Z4C*dwM5=Z)QN)IP0s`` or ``@Ugd_t@Fme!KW>!#GRH1&NdZON-VxdwZ9>(Su00``

### Decoding
- Strip `@U` prefix
- Replace `/` with `|`
- Decode with custom base85 scheme
- Reverse the order of the bits in each byte

### Interpretation
1. Item Type - variable length - item manufacturer and type. Ex. "jakobs shotgun" or "order repkit"
2. 25-bit separator - `0110000000011001000001100` - this sequence is present in all serials currently. Unknown whether it has a special meaning
3. Level - varint - 1 or 2 5-bit "chunks" where the 5th bit is a continuation indicator. The non-continuation bits from the chunks are combined, then reversed to get the level requirement for the item (8-bit int). 
    - `0` continuatuion bit denotes the end of the varint.
    - `1` continuatuion bit means the varint continues in the next chunk.
4. ???

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

