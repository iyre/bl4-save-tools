/**
 * Counter and progression system module.
 * Handles various game progression elements including:
 * - Collectibles completion
 * - Vault powers unlocking
 * - Ultra Vault Hunter mode unlocking
 * - Story progression flags
 */

/**
 * Completes all collectibles in the game.
 * Updates the following:
 * - All openworld collectibles categories from COLLECTIBLES template
 * - Eridian/Nyriad ECHO logs (sets to 262143)
 * - Updates SDU points display
 */
function completeAllCollectibles() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // Ensure the path exists
  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.collectibles = data.stats.openworld.collectibles || {};

  // For each top-level key in the template,
  // add/overwrite child keys individually to avoid removing unexpected keys.
  for (const [category, values] of Object.entries(COLLECTIBLES)) {
    data.stats.openworld.collectibles[category] = data.stats.openworld.collectibles[category] || {};
    // If the value is an object, copy keys individually
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      for (const [k, v] of Object.entries(values)) {
        // If nested object (e.g., echologs_general), handle one more level
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          data.stats.openworld.collectibles[category][k] =
            data.stats.openworld.collectibles[category][k] || {};
          for (const [kk, vv] of Object.entries(v)) {
            data.stats.openworld.collectibles[category][k][kk] = vv;
          }
        } else {
          data.stats.openworld.collectibles[category][k] = v;
        }
      }
    } else {
      // For non-object values, just assign
      data.stats.openworld.collectibles[category] = values;
    }
  }

  // Eridian/Nyriad ECHO logs
  data.state.seen_eridium_logs = 262143;

  // Update the editor with the new YAML
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  updateSDUPoints();
}

/**
 * Opens all vault doors, removing their "search" circles from the map.
 */
function openAllVaultDoors() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.collectibles = data.stats.openworld.collectibles || {};

  for (const category of ['vaultdoor', 'vaultlock']) {
    if (typeof COLLECTIBLES !== 'object' || typeof COLLECTIBLES[category] !== 'object') {
      console.error('unable to open vault doors - COLLECTIBLES data missing or invalid');
      continue;
    }
    data.stats.openworld.collectibles[category] = COLLECTIBLES[category];
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All vault doors opened!');
}

/**
 * Unlocks all Vault Powers across all areas.
 * Sets the vault power flags for:
 * - Grasslands
 * - Shattered Lands
 * - Mountains
 */
function unlockVaultPowers() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.collectibles = data.stats.openworld.collectibles || {};

  data.stats.openworld.collectibles.vaultpower_grasslands = 1;
  data.stats.openworld.collectibles.vaultpower_shatteredlands = 1;
  data.stats.openworld.collectibles.vaultpower_mountains = 1;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function unlockUVHMode() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.globals = data.globals || {};
  data.globals.highest_unlocked_vault_hunter_level = 5;
  data.globals.vault_hunter_level = 1;

  completeUVHChallenges();

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

/**
 * Sets various story progression flags and values.
 * Updates:
 * - Global lockdown status
 * - Main mission completion counter
 * - Character progress entries (credits seen flag)
 */
function setStoryValues() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.globals = data.globals || {};
  data.globals.lockdownlifted = true;

  // Set stats.challenge // some of these are updated automatically, so aren't set here
  data.stats.challenge = data.stats.challenge || {};
  data.stats.challenge.mission_main_all = 18;

  // Set unlockables.character_progress.entries (append if not present) - not sure what this does
  data.unlockables = data.unlockables || {};
  data.unlockables.character_progress = data.unlockables.character_progress || {};
  let entries = data.unlockables.character_progress.entries || [];
  if (!entries.includes('character_progress.seen_credits')) {
    entries.push('character_progress.seen_credits');
  }
  data.unlockables.character_progress.entries = entries;

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}
