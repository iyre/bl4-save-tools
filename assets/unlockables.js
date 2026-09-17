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
function mergeUnlockableEntries(data, key, prefix = '') {
  data.domains.local.unlockables[key] = data.domains.local.unlockables[key] || {};
  const existing = data.domains.local.unlockables[key].entries || [];
  const merged = new Set(existing);
  for (const entry of UNLOCKABLES[key].entries) {
    if (entry.startsWith(prefix)) {
      merged.add(entry);
    }
  }
  data.domains.local.unlockables[key].entries = Array.from(merged).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
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

/**
 * Completes all shared collectibles in a profile save.
 * This includes ECHO logs and excludes activities.
 */
function completeSharedCollectibles() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  mergeUnlockableEntries(data, 'echo_log_challenges');
  mergeUnlockableEntries(data, 'echo_upgrade_challenges', 'echo_upgrade_challenges.collect');
  mergeUnlockableEntries(data, 'sharedprogress_cello');
  mergeUnlockableEntries(data, 'sharedprogress_cowbell', 'SharedProgress_Cowbell.collectible');
  mergeUnlockableEntries(data, 'sharedprogress_harmonica', 'SharedProgress_Harmonica.collectible');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All shared collectibles completed!');
  updateEchoPoints();
}

/**
 * Completes all shared vault unlocks in a profile save.
 */
function completeSharedVaultUnlocks() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!hasProfileUnlockables(data)) return;

  mergeUnlockableEntries(data, 'vault_object_challenges');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All vault unlocks completed!');
}

function unlockFastTravel() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!isProfileSave) return;

  mergeUnlockableEntries(data, 'echo_upgrade_challenges', 'echo_upgrade_challenges.activity_safehouses');
  mergeUnlockableEntries(data, 'echo_upgrade_challenges', 'echo_upgrade_challenges.activity_silos');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function completeAllActivities() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (!isProfileSave) return;

  mergeUnlockableEntries(data, 'echo_upgrade_challenges', 'echo_upgrade_challenges.activity');
  mergeUnlockableEntries(data, 'sharedprogress_cowbell', 'SharedProgress_Cowbell.zoneactivity');
  mergeUnlockableEntries(data, 'sharedprogress_harmonica', 'SharedProgress_Harmonica.zoneactivity');

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}