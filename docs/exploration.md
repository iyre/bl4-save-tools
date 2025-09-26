# Exploration

## Location Discovery
Location icons (points of interest) on the map are revealed when you get close enough to discover them.

Discovered locations are stored in the save file YAML under `gbx_discovery_pg` > `dlblob`
- List of location IDs, e.g. `DLMD_World_P_IO_LostCapsule_DecryptStation_UAID_089204DCF7EF54FE01_1960602211:2:`
- Location IDs are stored end-to-end in a **long** uncompressed string (can exceed 50k characters, i.e. 50 KB).
- IDs are always followed by either `:1:` or `:2:` which serve as separators (meaning unknown).

Most POIs don't have easily distinguishable names. For example, all activities have the same prefix, `DLMD_World_P_PoAActor_UAID`, but specific activities (e.g. safehouses) aren't differentiated.

## Fog of War Data
This is how the game progressively reveals the map as you explore new areas.

Map exploration data is stored in the save file YAML under `gbx_discovery_pc` > `foddatas`\
This contains a list of entries, one per level, each with:
- `levelname` - the internal name of the level/map, e.g. `Vault_Grasslands_P`
- `foddimensionx`, `foddimensiony` - Dimensions of the FoW "map" (`128x128`)
- `compressiontype` - Compression type used (`zlib`)
- `foddata` - The encoded "map" data which the other fields describe

Set `foddata` to this sting to remove all fog: `eJztwTEBAAAAwqD+qWcMH6AAAAAAAAAAAAAAAAAAAACAtwGw2cOy`\
It's a full 16KB map of all `0xFF` bytes, but is very short thanks to compression.

These FoW maps are essentially masks that are laid over the _real_ map to mask out what you are able to see. Each map is a grid of cells (size defined by foddimensions). Each "cell" is represented with a whole byte, allowing for partial exploration. In order to reveal the entire map we just need to set all bytes in the fod grid to `0xFF`, i.e. the 100% value. Each map is exactly 16 KB (`128x128=16384`). The byte arrays are compressed and then encoded with base64 to create ASCII strings which can be stored in the YAML save file.

#### Example: Decode a foddata string from the YAML
```python
import base64, zlib

foddata_b64 = entry['foddata'] # entry from gbx_discovery_pc['foddatas']
compressed = base64.b64decode(foddata_b64)
decompressed = zlib.decompress(compressed)
# Now 'decompressed' is a bytes object (length 16384), can be modified as a bytearray
fog_bytes = bytearray(decompressed)
```

#### Example: Generate a grayscale image from the decoded byte array
```python
from PIL import Image

img = Image.frombytes('L', (128, 128), fog_bytes)
img_large = img.resize((512, 512), resample=Image.NEAREST) # scale up the original image
img_large.show() # display the image
```

#### Example: Modify FoW data - reveal map
```python
fog_bytes = bytes([0xFF] * 16384) # set all bytes to FF (max value)
```

#### Example: Compress and encode back to foddata string
```python
compressed = zlib.compress(bytes(fog_bytes))
foddata_b64 = base64.b64encode(compressed).decode('ascii')
entry['foddata'] = foddata_b64
```