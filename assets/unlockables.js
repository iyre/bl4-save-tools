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
 * Unlocks all hover drive variants for every manufacturer.
 * Merges new hover drives with any existing ones while avoiding duplicates.
 * Entries are sorted case-insensitively for consistency.
 */
function unlockAllHoverDrives() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.unlockables = data.unlockables || {};
  data.unlockables.unlockable_hoverdrives =
    data.unlockables.unlockable_hoverdrives || {};
  let existing = Array.isArray(data.unlockables.unlockable_hoverdrives.entries)
    ? data.unlockables.unlockable_hoverdrives.entries
    : [];

  // Merge, deduplicate, and sort (case-insensitive)
  const merged = Array.from(
    new Set([...existing, ...UNLOCKABLE_HOVERDRIVES])
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  data.unlockables.unlockable_hoverdrives.entries = merged;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

const UNLOCKABLE_HOVERDRIVES = generateHoverDriveList();
/**
 * Generates a complete list of hover drive unlock entries.
 * Creates entries for all manufacturers (Borg, Daedalus, etc.) at all 5 tiers.
 * Handles special case formatting for Jakobs tier 1 and 3.
 * @returns {string[]} Array of hover drive unlock entry strings
 */
function generateHoverDriveList() {
  const manufacturers = [
    'Borg',
    'Daedalus',
    'Jakobs',
    'Maliwan',
    'Order',
    'Tediore',
    'Torgue',
    'Vladof',
  ];
  const list = [];
  for (const mfr of manufacturers) {
    for (let i = 1; i <= 5; i++) {
      // Special case: Jakobs_01 and Jakobs_03 should be "jakobs" -_-
      if (mfr === 'Jakobs' && (i === 1 || i === 3)) {
        list.push(
          `unlockable_hoverdrives.${mfr.toLowerCase()}_${String(i).padStart(
            2,
            '0'
          )}`
        );
      } else {
        list.push(
          `unlockable_hoverdrives.${mfr}_${String(i).padStart(2, '0')}`
        );
      }
    }
  }
  return list;
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

  if (!data.domains || !data.domains.local || !data.domains.local.unlockables)
    return;

  // Merge cosmetic unlocks for each key
  Object.keys(UNLOCKABLES).forEach((key) => {
    if (key === 'shared_progress') return; // skip this one - no cosmetics

    data.domains.local.unlockables[key] =
      data.domains.local.unlockables[key] || {};

    let existing = data.domains.local.unlockables[key].entries || [];
    let merged = new Set(existing);
    for (const entry of UNLOCKABLES[key].entries) {
      merged.add(entry);
    }

    data.domains.local.unlockables[key].entries = Array.from(merged).sort(
      (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
    );
  });

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log('All customizations unlocked!');
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

  // Be very sure we're in a profile save
  if (!data.domains || !data.domains.local || !data.domains.local.unlockables) {
    console.log(
      'Failed to find "domains.local.unlockables" key in YAML. ' +
        'This preset only works with profile saves.'
    );
    return;
  }

  data.domains.local.unlockables.shared_progress =
    data.domains.local.unlockables.shared_progress || {};
  let existing = data.domains.local.unlockables.shared_progress.entries || [];
  let merged = new Set(existing);
  for (const entry of UNLOCKABLES.shared_progress.entries) {
    merged.add(entry);
  }

  data.domains.local.unlockables.shared_progress.entries = Array.from(
    merged
  ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log('All new game shortcuts unlocked!');
}
