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
        list.push(`unlockable_hoverdrives.${mfr.toLowerCase()}_${String(i).padStart(2, '0')}`);
      } else {
        list.push(`unlockable_hoverdrives.${mfr}_${String(i).padStart(2, '0')}`);
      }
    }
  }
  return list;
}

function unlockAllSpecialization() {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert('Failed to parse YAML: ' + e);
    return;
  }
  if (!data.state) data.state = {};
  data.state.experience = data.state.experience || [];
  let found = false;
  for (const exp of data.state.experience) {
    if (exp.type === 'Specialization') {
      exp.level = 701;
      exp.points = 7431910510; // Set valid XP to avoid the GUI counter rolling over
      found = true;
    }
  }
  if (!found) {
    data.state.experience.push({ type: 'Specialization', level: 701 });
  }
  if (!data.progression) data.progression = {};
  data.progression.graphs = data.progression.graphs || [];
  let graph = data.progression.graphs.find((g) => g.name === 'ProgressGraph_Specializations');
  if (!graph) {
    graph = {
      name: 'ProgressGraph_Specializations',
      group_def_name: 'progress_group',
      nodes: [],
    };
    data.progression.graphs.push(graph);
  }
  const specNames = [
    'Survivor',
    'Artificer',
    'Enforcer',
    'Slayer',
    'Hunter',
    'Adventurer',
    'Wanderer',
  ];
  let foundGroupDef = null;
  if (Array.isArray(data.progression.graphs)) {
    for (const g of data.progression.graphs) {
      if (g.group_def_name && g.group_def_name !== 'progress_group') {
        foundGroupDef = g.group_def_name;
        break;
      }
    }
  }
  graph.group_def_name = foundGroupDef || graph.group_def_name || '';
  graph.nodes = specNames.map((name) => ({
    name,
    points_spent: 100,
  }));
  if (!graph.group_def_name) {
    alert(
      'Warning: No character-specific group_def_name found in progression.graphs. Please unlock at least one specialization in-game first, then use this tool.'
    );
  }
  if (!data.progression.point_pools) data.progression.point_pools = {};
  data.progression.point_pools.specializationtokenpool = 700;
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log('All Specializations unlocked and maxed out!');
  stageEpilogueMission(); // Stage epilogue mission to ensure specialization system is enabled.
  showPresetNotification();
}
