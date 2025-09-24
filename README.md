# Borderlands 4 Save Tools
Web-based tool for modifying Borderlands 4 (Steam) save files.

- Decrypt `.sav` file to human-readable YAML
- Export as re-encrypted `.sav` file or YAML
- Manually edit save YAML within the web page
- Apply pre-configured modifications
  - Clear map fog
  - Discover all locations* (that I have personally discovered)
  - Complete all safehouse missions to unlock fast travel
  - Complete all main story missions
  - Unlock UVH mode

## Where Are My Saves
### Windows
- Navigate to `%USERPROFILE%\Documents\My Games\Borderlands 4\Saved\SaveGames\`
- You should see a sub-folder with a 17-digit name - this is your steam ID which you'll need to encrypt/decrypt save files.
- Navigate deeper like `.\<steam_id>\Profiles\client\`
- `#.sav` files represent characters
- `profile.sav` contains global state such as Maurice inventory and bank contents. (the editor also works with this file)

## Acknowledgements
- Decryption functionality is based on https://github.com/glacierpiece/borderlands-4-save-utility
