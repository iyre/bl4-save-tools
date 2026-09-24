/**
 * Counter and progression system module.
 * Handles various game progression elements including:
 * - Collectibles completion and reset, by type and content scope
 * - Vault powers unlocking
 * - Ultra Vault Hunter mode unlocking
 * - Story progression flags
 */

/**
 * Collectible types shown as separate presets in character saves.
 * - base / dlc: dotted paths from the save root. Values come from the same path in COLLECTIBLES.
 * Vault doors, locks, keys, and powers are handled by the vault presets instead.
 * Types after Tediore Collectibles are DLC openworld counters that may not be collectibles as such.
 */
const CHARACTER_COLLECTIBLE_TYPES = [
  {
    key: 'echolog',
    label: 'Echo Logs',
    base: [
      'stats.openworld.collectibles.echologs_arjay',
      'stats.openworld.collectibles.echologs_general',
      'stats.openworld.collectibles.echologs_vaulthunter',
    ],
    dlc: [
      'stats.cello_openworld.cello_collectibles.dlc2_echologs',
      'stats.cowbell_openworld.cowbell_collectibles.dlc1_echologs',
      'stats.harmonica_openworld.dlc2_collectibles.harmonica_echologs',
      'stats.harp_openworld.harp_collectibles.harp_echologs',
      'stats.tuba_openworld.tuba_collectibles.tuba_echologs',
      'stats.viola_openworld.viola_collectibles.viola_echologs',
    ],
  },
  {
    key: 'eridianlog',
    label: 'Eridian Logs',
    desc: 'Eridian/Nyriad echo logs.',
    base: ['state.seen_eridium_logs'],
  },
  {
    key: 'vaultsymbol',
    label: 'Vault Symbols',
    base: ['stats.openworld.collectibles.vaultsymbols'],
    dlc: ['stats.cowbell_openworld.cowbell_collectibles.dlc1_vaultsymbols'],
  },
  {
    key: 'cache',
    label: 'Caches',
    base: ['stats.openworld.collectibles.caches'],
    dlc: ['stats.cowbell_openworld.cowbell_collectibles.dahlcaches'],
  },
  { key: 'capsule', label: 'Capsules', base: ['stats.openworld.collectibles.capsules'] },
  { key: 'evocarium', label: 'Evocariums', base: ['stats.openworld.collectibles.evocariums'] },
  { key: 'speaker', label: 'Propaganda Speakers', base: ['stats.openworld.collectibles.propaspeakers'] },
  {
    key: 'safe',
    label: 'Safes',
    base: ['stats.openworld.collectibles.safes'],
    dlc: ['stats.harmonica_openworld.dlc2_collectibles.islandsafes'],
  },
  {
    key: 'shrine',
    label: 'Shrines',
    base: ['stats.openworld.collectibles.shrines'],
  },
  {
    key: 'clot',
    label: 'Clots',
    dlc: ['stats.cowbell_openworld.cowbell_misc.clots'],
  },
  {
    key: 'kickdown',
    label: 'Kick-down Shortcuts',
    dlc: ['stats.cowbell_openworld.cowbell_misc.kickdowns'],
  },
  {
    key: 'recordplayer',
    label: 'Record Players',
    dlc: ['stats.cowbell_openworld.cowbell_collectibles.recordplayers'],
  },
  {
    key: 'shuggurathtank',
    label: 'Shuggurath Tanks',
    dlc: ['stats.cowbell_openworld.cowbell_misc.shuggurathtanks'],
  },
  {
    key: 'speakeasyportal',
    label: 'Speakeasy Portals',
    dlc: ['stats.cowbell_openworld.cowbell_activities.speakeasyportals'],
  },
  {
    key: 'spookystories',
    label: 'Spooky Stories',
    dlc: ['stats.cowbell_challenges.spooky_story'],
  },
  {
    key: 'digigunk',
    label: 'Digigunk',
    dlc: ['stats.harmonica_openworld.dlc2_misc.dlc2_digigunk'],
  },
  {
    key: 'substation',
    label: 'Substation Switches',
    dlc: ['stats.harmonica_openworld.dlc2_activities.treasurehunt'],
  },
  {
    key: 'tediore',
    label: 'Tediore Guns',
    dlc: ['stats.harmonica_openworld.dlc2_collectibles.tediore'],
  },
  {
    key: 'zipline',
    label: 'Zipline Shortcuts',
    dlc: ['stats.harmonica_openworld.dlc2_misc.ziplineshortcuts'],
  },
];

/**
 * Returns the save paths for a collectible type ('all' or a CHARACTER_COLLECTIBLE_TYPES key)
 * in scope ('base' | 'dlc' | 'all').
 */
function getCollectiblePaths(type, scope) {
  const types = type === 'all' ? CHARACTER_COLLECTIBLE_TYPES : [getCollectibleType(type)];
  const scopes = scope === 'all' ? ['base', 'dlc'] : [scope];
  return types.flatMap((t) => scopes.flatMap((s) => t[s] || []));
}

function getCollectibleType(type) {
  return CHARACTER_COLLECTIBLE_TYPES.find((t) => t.key === type);
}

function describeCollectibles(type, scope) {
  const noun = type === 'all' ? 'collectibles' : getCollectibleType(type).label.toLowerCase();
  return scope === 'all' ? `all ${noun}` : `${CONTENT_SCOPE_LABELS[scope]} ${noun}`;
}

function getPathValue(obj, path) {
  return path.split('.').reduce((node, key) => node?.[key], obj);
}

/**
 * Copies every leaf of source into target, keeping existing keys that aren't in source.
 * Numeric leaves are only raised, never lowered. Returns the number of leaves changed.
 */
function mergeCounterLeaves(target, source) {
  let count = 0;
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      count += mergeCounterLeaves(target[key], value);
    } else if (!(typeof target[key] === 'number' && target[key] >= value)) {
      target[key] = value;
      count++;
    }
  }
  return count;
}

/**
 * Removes every leaf of template from target, then any maps left empty.
 * Returns the number of leaves removed.
 */
function removeCounterLeaves(target, template) {
  let count = 0;
  for (const [key, value] of Object.entries(template)) {
    if (!(key in target)) continue;
    if (value && typeof value === 'object' && target[key] && typeof target[key] === 'object') {
      count += removeCounterLeaves(target[key], value);
      if (Object.keys(target[key]).length === 0) delete target[key];
    } else {
      delete target[key];
      count++;
    }
  }
  return count;
}

/**
 * Completes character save collectibles of a type ('all' or a CHARACTER_COLLECTIBLE_TYPES key)
 * in scope ('base' | 'dlc' | 'all').
 */
function completeCollectibles(type, scope) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // Wrap each path's template in its parent keys so it can be merged from the save root
  let count = 0;
  for (const path of getCollectiblePaths(type, scope)) {
    const source = path
      .split('.')
      .reduceRight((value, key) => ({ [key]: value }), getPathValue(COLLECTIBLES, path));
    count += mergeCounterLeaves(data, source);
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Completed ${describeCollectibles(type, scope)} (${count} counters).`;
}

/**
 * Removes the counters completeCollectibles sets for the same type and scope.
 */
function resetCollectibles(type, scope) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  let count = 0;
  for (const path of getCollectiblePaths(type, scope)) {
    const keys = path.split('.');
    const leaf = keys.pop();
    const parent = getPathValue(data, keys.join('.'));
    if (!parent || typeof parent !== 'object') continue;
    count += removeCounterLeaves(parent, { [leaf]: getPathValue(COLLECTIBLES, path) });

    // Remove ancestors left empty, keeping top-level sections like stats and state
    while (keys.length > 1) {
      const key = keys.pop();
      const node = getPathValue(data, keys.join('.'));
      if (Object.keys(node[key]).length > 0) break;
      delete node[key];
    }
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Reset ${describeCollectibles(type, scope)} (${count} counters).`;
}

// Base game collectible categories for vault doors, along with the locks and keys that open them
const VAULT_DOOR_CATEGORIES = [
  'vaultdoor',
  'vaultlock',
  'vaultkey_grasslands',
  'vaultkey_mountains',
  'vaultkey_shatteredlands',
];

/**
 * Opens all vault doors, removing their "search" circles from the map.
 */
function openAllVaultDoors() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.collectibles = data.stats.openworld.collectibles || {};

  const template = COLLECTIBLES?.stats?.openworld?.collectibles || {};
  for (const category of VAULT_DOOR_CATEGORIES) {
    if (typeof template[category] !== 'object') {
      console.error('unable to open vault doors - COLLECTIBLES data missing or invalid');
      continue;
    }
    data.stats.openworld.collectibles[category] = template[category];
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All vault doors opened!');
}

/**
 * Closes all vault doors by removing their collectible keys.
 */
function closeAllVaultDoors() {
  removeCollectibleKeys(VAULT_DOOR_CATEGORIES);
}

/**
 * Completes all vaults: vault missions, doors, and powers.
 */
function completeVaults() {
  if (!getYamlDataFromEditor()) return;
  mergeMissionsetsWithPrefix('missionset_vault_');
  openAllVaultDoors();
  unlockVaultPowers();
  return 'Completed vault missions, doors, and powers.';
}

/**
 * Resets vault missions and doors. Vault powers are left in place and reset separately.
 */
function resetVaults() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const sets = data.missions?.local_sets || {};
  for (const key of Object.keys(sets)) {
    if (key.startsWith('missionset_vault_')) delete sets[key];
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));

  closeAllVaultDoors();
  return 'Reset vault missions and doors. Vault powers are unchanged.';
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

/**
 * Removes the vault power flags set by unlockVaultPowers.
 */
function resetVaultPowers() {
  removeCollectibleKeys(['vaultpower_grasslands', 'vaultpower_shatteredlands', 'vaultpower_mountains']);
}

/**
 * Deletes the given keys from stats.openworld.collectibles, if present.
 */
function removeCollectibleKeys(keys) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const collectibles = data.stats?.openworld?.collectibles;
  if (!collectibles) return;
  for (const key of keys) delete collectibles[key];

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function unlockPostgame() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.globals = data.globals || {};
  data.globals.highest_unlocked_vault_hunter_level = 6;
  data.globals.vault_hunter_level = 1;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);

  if (typeof completeUVHChallenges === 'function') completeUVHChallenges();
  if (typeof mergeMissionsetsWithPrefix === 'function') mergeMissionsetsWithPrefix('missionset_main_postgame');
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
