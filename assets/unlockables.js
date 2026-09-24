/**
 * Unlockables and progression management module.
 * Handles unlockable game content including:
 * - Hover drives for all manufacturers
 * - Cosmetic items and customizations
 * - New game shortcuts and shared progress
 *
 * Most unlockables are stored as arrays of string entries in the save file.
 */

/**
 * Returns true if data has the profile save unlockables structure, false otherwise.
 * Logs a warning when the check fails.
 */
function hasProfileUnlockables(data) {
  if (!data.domains?.local?.unlockables) {
    console.log(
      'Failed to find "domains.local.unlockables" key in YAML. ' +
        'This preset only works with profile saves.'
    );
    return false;
  }
  return true;
}

/**
 * Merges entries from UNLOCKABLES[key] into data.domains.local.unlockables[key].entries,
 * deduplicating and sorting the result.
 */
function entryHasPrefix(entry, prefix) {
  return entry.toLowerCase().startsWith(prefix.toLowerCase());
}

function mergeUnlockableEntries(data, key, prefix = '') {
  data.domains.local.unlockables[key] = data.domains.local.unlockables[key] || {};
  const existing = data.domains.local.unlockables[key].entries || [];
  const merged = new Set(existing);
  for (const entry of UNLOCKABLES[key].entries) {
    if (entryHasPrefix(entry, prefix)) {
      merged.add(entry);
    }
  }
  data.domains.local.unlockables[key].entries = Array.from(merged).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  return merged.size - existing.length;
}

/**
 * Removes entries matching prefix from data.domains.local.unlockables[key].entries.
 * Returns the number of entries removed.
 */
function removeUnlockableEntries(data, key, prefix = '') {
  const group = data.domains.local.unlockables[key];
  if (!group?.entries) return 0;
  const before = group.entries.length;
  group.entries = group.entries.filter((entry) => !entryHasPrefix(entry, prefix));
  return before - group.entries.length;
}

// [unlockables key, entry prefix] pairs for shared progress, split by content scope
const SHARED_PROGRESS_SOURCES = {
  collectible: {
    base: [
      ['echo_log_challenges', ''],
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.collect'],
    ],
    dlc: [
      ['sharedprogress_cello', 'SharedProgress_Cello.collectible'],
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible'],
      ['sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible'],
      ['sharedprogress_tuba', 'SharedProgress_Tuba.collectible'],
      ['sharedprogress_viola', 'SharedProgress_Viola.collectible'],
    ],
  },
  activity: {
    base: [['echo_upgrade_challenges', 'echo_upgrade_challenges.activity']],
    dlc: [
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.zoneactivity'],
      ['sharedprogress_harmonica', 'SharedProgress_Harmonica.zoneactivity'],
    ],
  },
};

/**
 * Collectible types shown as separate presets.
 * - profile: [unlockables key, entry prefix] pairs in the profile save.
 *   Keys starting with "sharedprogress_" are DLC content; everything else is base game.
 */
const COLLECTIBLE_TYPES = [
  {
    key: 'echolog',
    label: 'Echo Logs',
    profile: [
      ['echo_log_challenges', ''],
      ['sharedprogress_cello', 'SharedProgress_Cello.collectible_echolog'],
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible_echolog'],
      ['sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible_echolog'],
      ['sharedprogress_tuba', 'SharedProgress_Tuba.collectible_echolog'],
      ['sharedprogress_viola', 'SharedProgress_Viola.collectible_echolog'],
    ],
  },
  {
    key: 'vaultsymbol',
    label: 'Vault Symbols',
    profile: [
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_vaultsymbols'],
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible_vaultsymbols'],
    ],
  },
  {
    key: 'cache',
    label: 'Caches',
    profile: [
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_caches'],
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible_dahlcaches'],
    ],
  },
  {
    key: 'capsule',
    label: 'Capsules',
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_capsules']],
  },
  {
    key: 'evocarium',
    label: 'Evocariums',
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_evocariums']],
  },
  {
    key: 'speaker',
    label: 'Propaganda Speakers',
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_propagandaspeakers']],
  },
  {
    key: 'safe',
    label: 'Safes',
    profile: [
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_safes'],
      ['sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible_islandsafe'],
    ],
  },
  {
    key: 'shrine',
    label: 'Shrines',
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.collect_shrines']],
  },
  {
    key: 'recordplayer',
    label: 'Record Players',
    profile: [['sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible_recordplayer']],
  },
  {
    key: 'substation',
    label: 'Substation Switches',
    profile: [['sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible_treasurehunt']],
  },
  {
    key: 'tediore',
    label: 'Tediore Guns',
    profile: [['sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible_tediore']],
  },
];

function inScope(isBase, scope) {
  return scope === 'all' || (scope === 'base') === isBase;
}

function isBaseProfileSource([key]) {
  return !key.startsWith('sharedprogress_');
}

function getSharedProgressType(kind, type) {
  return (kind === 'collectible' ? COLLECTIBLE_TYPES : ACTIVITY_TYPES).find((t) => t.key === type);
}

/**
 * Returns [unlockables key, prefix] sources for kind ('collectible' | 'activity'),
 * scope ('base' | 'dlc' | 'all'), and type ('all' or a key from the kind's type list).
 */
function getSharedProgressSources(kind, scope, type = 'all') {
  if (type !== 'all') {
    const { profile } = getSharedProgressType(kind, type);
    return profile.filter((source) => inScope(isBaseProfileSource(source), scope));
  }
  const sources = SHARED_PROGRESS_SOURCES[kind];
  return scope === 'all' ? [...sources.base, ...sources.dlc] : sources[scope];
}

function describeSharedProgress(kind, scope, type = 'all') {
  let noun = kind === 'collectible' ? 'collectibles' : 'activities';
  if (type !== 'all') noun = getSharedProgressType(kind, type).label.toLowerCase();
  return scope === 'all' ? `all ${noun}` : `${CONTENT_SCOPE_LABELS[scope]} ${noun}`;
}

/**
 * Completes shared (profile) collectibles or activities for the given scope and type.
 */
function completeSharedProgress(kind, scope, type = 'all') {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  let count = 0;
  for (const [key, prefix] of getSharedProgressSources(kind, scope, type)) {
    count += mergeUnlockableEntries(data, key, prefix);
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  updateEchoPoints();
  return `Completed ${describeSharedProgress(kind, scope, type)} (${count} new entries).`;
}

function removeSharedProgress(kind, scope, type = 'all') {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  let count = 0;
  for (const [key, prefix] of getSharedProgressSources(kind, scope, type)) {
    count += removeUnlockableEntries(data, key, prefix);
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Reset ${describeSharedProgress(kind, scope, type)} (${count} entries).`;
}

/**
 * Unlocks all vault card purchases in a profile save.
 * These must be present for cosmetics with the same name to be usable.
 */
function unlockAllVaultCardPurchases() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data['oak.ui.dlc_data'] = data['oak.ui.dlc_data'] || {};
  data['oak.ui.dlc_data'].ui_dlc_data = data['oak.ui.dlc_data'].ui_dlc_data || {};

  let existing = data['oak.ui.dlc_data'].ui_dlc_data.vaultcard_purchases || [];
  let merged = new Set(existing);
  for (const entry of UNLOCKABLES['vaultcard_purchases']) {
    merged.add(entry);
  }

  data['oak.ui.dlc_data'].ui_dlc_data.vaultcard_purchases = Array.from(merged).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All Vault Card purchases unlocked!');
}

/**
 * Unlocks all cosmetic items in a profile save.
 * Processes all cosmetic categories from the UNLOCKABLES template,
 * merging new entries with existing ones while avoiding duplicates.
 * Only works with profile saves that have the proper unlockables structure.
 */
function unlockAllCosmetics() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  // Merge cosmetic unlocks for each key
  Object.keys(UNLOCKABLES).forEach((key) => {
    // skip these - not cosmetics
    if (!key.startsWith('unlockable')) return;
    if (key === 'unlockable_hoverdrives') return;
    mergeUnlockableEntries(data, key);
  });

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All customizations unlocked!');
  unlockAllVaultCardPurchases();
}

/**
 * Unlocks all hover drive variants for every manufacturer.
 * Merges new hover drives with any existing ones while avoiding duplicates.
 * Entries are sorted case-insensitively for consistency.
 */
function unlockAllHoverDrives() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  mergeUnlockableEntries(data, 'unlockable_hoverdrives');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All hover drive variants unlocked!');
}

/**
 * Unlocks all new game shortcuts in a profile save.
 * Sets shared progress entries to enable features like:
 * - Prologue skip
 * - Story skip
 * - Early specialization system access
 * Only works with profile saves that have the proper unlockables structure.
 */
function unlockNewGameShortcuts() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  mergeUnlockableEntries(data, 'shared_progress');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All new game shortcuts unlocked!');
}

// vault_object_challenges entry prefixes, split into vault doors (with their keys and locks) and powers
const VAULT_OBJECT_PREFIXES = {
  doors: [
    'vault_object_challenges.collect_vaultkey',
    'vault_object_challenges.unlock_vaultdoor',
    'vault_object_challenges.unlock_vaultlock',
  ],
  powers: ['vault_object_challenges.collect_vaultpower'],
};

/**
 * Completes shared vault object entries in a profile save. kind: 'doors' | 'powers'
 */
function completeVaultObjects(kind) {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  let count = 0;
  for (const prefix of VAULT_OBJECT_PREFIXES[kind]) {
    count += mergeUnlockableEntries(data, 'vault_object_challenges', prefix);
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Unlocked vault ${kind} (${count} new entries).`;
}

function resetVaultObjects(kind) {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  let count = 0;
  for (const prefix of VAULT_OBJECT_PREFIXES[kind]) {
    count += removeUnlockableEntries(data, 'vault_object_challenges', prefix);
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Reset vault ${kind} (${count} entries).`;
}

function unlockFastTravel() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!isProfileSave) return;

  let count = 0;
  for (const prefix of FAST_TRAVEL_PREFIXES) {
    count += mergeUnlockableEntries(data, 'echo_upgrade_challenges', prefix);
  }

  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  updateEchoPoints();
  discoverSafehouseLocations();
  return `Unlocked ${count} fast travel points.`;
}

function removeFastTravel() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  let count = 0;
  for (const prefix of FAST_TRAVEL_PREFIXES) {
    count += removeUnlockableEntries(data, 'echo_upgrade_challenges', prefix);
  }

  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Removed ${count} fast travel points.`;
}

const FAST_TRAVEL_PREFIXES = [
  'echo_upgrade_challenges.activity_safehouses',
  'echo_upgrade_challenges.activity_silos',
];