// Functions for manipulating unlockables, typically structured as lists/arrays

function unlockAllHoverDrives() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // Ensure the nested structure exists
  data.unlockables = data.unlockables || {};
  data.unlockables.unlockable_hoverdrives = data.unlockables.unlockable_hoverdrives || {};
  let existing = Array.isArray(data.unlockables.unlockable_hoverdrives.entries)
    ? data.unlockables.unlockable_hoverdrives.entries
    : [];

  // Merge, deduplicate, and sort (case-insensitive)
  const merged = Array.from(new Set([...existing, ...UNLOCKABLE_HOVERDRIVES])).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  data.unlockables.unlockable_hoverdrives.entries = merged;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  showPresetNotification();
}

const UNLOCKABLE_HOVERDRIVES = generateHoverDriveList();
function generateHoverDriveList() {
  const manufacturers = [
    'Borg', 'Daedalus', 'Jakobs', 'Maliwan', 'Order',
    'Tediore', 'Torgue', 'Vladof'
  ];
  const list = [];
  for (const mfr of manufacturers) {
    for (let i = 1; i <= 5; i++) {
      // Special case: Jakobs_01 and Jakobs_03 should be "jakobs" -_-
      if (mfr === 'Jakobs' && (i === 1 || i === 3)) {
        list.push(`unlockable_hoverdrives.${mfr.toLowerCase()}_${String(i).padStart(2, '0')}`);
      } else {
        list.push(`unlockable_hoverdrives.${mfr}_${String(i).padStart(2, '0')}`);
      }
    }
  }
  return list;
}
