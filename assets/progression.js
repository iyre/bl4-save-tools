// Functions related to character progression

function updateSDUPoints() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  let pointTotal = 0;

  // Activities
  const activityPoints = 40;
  const activityNames = [
    'missionset_zoneactivity_crawler',
    'missionset_zoneactivity_drillsite',
    'missionset_zoneactivity_mine',
    'missionset_zoneactivity_orderbunker',
    'missionset_zoneactivity_safehouse',
    'missionset_zoneactivity_silo',
  ];

  const missionSets = (data.missions || {}).local_sets || {};
  for (const activity of activityNames) {
    const missions = (missionSets[activity] || {}).missions || {};
    let completedActivities = 0;
    for (const m of Object.values(missions)) {
      if (typeof m === 'object' && m.status === 'completed') {
        completedActivities += 1;
      }
    }
    pointTotal += completedActivities * activityPoints;
  }

  // Collectibles
  const collectiblePoints = {
    propaspeakers: 20,
    capsules: 15,
    evocariums: 15,
    augurshrines: 10,
    caches: 10,
    safes: 10,
    vaultsymbols: 5,
  };

  const collectibles = ((data.stats || {}).openworld || {}).collectibles || {};
  for (const key in collectiblePoints) {
    if (collectibles.hasOwnProperty(key)) {
      if (typeof collectibles[key] === 'object') {
        pointTotal +=
          Object.keys(collectibles[key]).length * collectiblePoints[key];
      } else {
        pointTotal += collectiblePoints[key];
      }
    }
  }

  // Write value to progression.point_pools.echotokenprogresspoints only if higher
  data.progression = data.progression || {};
  data.progression.point_pools = data.progression.point_pools || {};
  const oldPointTotal =
    data.progression.point_pools.echotokenprogresspoints || 0;
  if (pointTotal <= oldPointTotal) {
    console.log(
      `Not updating echotokenprogresspoints: current ${oldPointTotal} > calculated ${pointTotal}`
    );
    return;
  }
  data.progression.point_pools.echotokenprogresspoints = pointTotal;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log(
    `Updated echotokenprogresspoints: ${oldPointTotal} -> ${pointTotal}`
  );
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
  let graph = data.progression.graphs.find(
    (g) => g.name === 'ProgressGraph_Specializations'
  );
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
      'Warning: No character-specific group_def_name found in progression.graphs. ' +
        'Please unlock at least one specialization in-game first, then use this tool.'
    );
  }
  if (!data.progression.point_pools) data.progression.point_pools = {};
  data.progression.point_pools.specializationtokenpool = 700;
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log('All Specializations unlocked and maxed out!');
  stageEpilogueMission(); // Stage epilogue mission to ensure specialization system is unlocked.
  showPresetNotification();
}

function setCharacterToMaxLevel() {
  setCharacterLevel(50, 3430227);
  showPresetNotification();
}

function setCharacterLevel(level, xp = null) {
  const data = getYamlDataFromEditor();
  if (!data || !data.state || !data.state.experience) return;
  const idx = data.state.experience.findIndex(
    (exp) => exp.type === 'Character'
  );
  if (idx === -1) {
    console.log('Character experience entry not found.');
    return;
  }

  xp = xp || calculateCharacterXp(level);
  data.state.experience[idx].level = level;
  data.state.experience[idx].points = xp;

  data.progression.point_pools = data.progression.point_pools || {};
  data.progression.point_pools.characterprogresspoints = level - 1;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log(`Set character level to ${level} (XP: ${xp})`);
}

function generateUUID() {
  // RFC4122 version 4 compliant UUID
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

function setCharacterClass(className, charName) {
  const data = getYamlDataFromEditor();
  if (!data || !data.state) return;

  // Class seems to be all you really need to change.
  // Character-specific things like progression graphs are cleared when loading the save.
  data.state.class = 'Char_' + className;
  data.state.char_name = charName; // This name is displayed in character selection
  data.state.char_guid = generateUUID(); // New GUID to avoid UI issues if swapping saves from the main menu

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log(`Set character class: ${className}`);
}
