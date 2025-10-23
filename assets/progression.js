/**
 * Character progression and advancement system module.
 * Handles:
 * - SDU points and upgrades
 * - Character level and experience
 * - Specialization system unlocks
 * - Character class management
 * - Global unlock and max-out functionality
 */

/**
 * Updates the SDU (Storage Deck Upgrade) points based on completed activities and collectibles.
 * Points are awarded for:
 * - Completed zone activities (40 points each)
 * - Various collectible types with different point values
 * Only updates if the calculated total is higher than existing points.
 */
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
        pointTotal += Object.keys(collectibles[key]).length * collectiblePoints[key];
      } else {
        pointTotal += collectiblePoints[key];
      }
    }
  }

  // Write value to progression.point_pools.echotokenprogresspoints only if higher
  data.progression = data.progression || {};
  data.progression.point_pools = data.progression.point_pools || {};
  const oldPointTotal = data.progression.point_pools.echotokenprogresspoints || 0;
  if (pointTotal <= oldPointTotal) {
    console.log(
      `Not updating echotokenprogresspoints: current ${oldPointTotal} > calculated ${pointTotal}`
    );
    return;
  }
  data.progression.point_pools.echotokenprogresspoints = pointTotal;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log(`Updated echotokenprogresspoints: ${oldPointTotal} -> ${pointTotal}`);
}

/**
 * Unlocks and maxes out all specializations for the character.
 * - Sets specialization level to 701
 * - Sets appropriate XP value
 * - Unlocks all specialization trees
 * - Allocates maximum points to each specialization
 * - Sets specialization tokens to maximum
 * - Ensures specialization system is properly unlocked via epilogue mission
 */
function unlockAllSpecialization() {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    console.error('YAML parse error:', e);
    alert('Failed to parse YAML: ' + e);
    return;
  }
  if (!data.state) data.state = {};
  data.state.experience = data.state.experience || [];
  let found = false;
  for (const exp of data.state.experience) {
    if (exp.type === 'Specialization') {
      exp.level = 701;
      exp.points = 7431910510; // Set valid XP to avoid the GUI counter rolling over. // oops, good catch - lunar
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
      'Warning: No character-specific group_def_name found in progression.graphs. ' +
        'Please unlock at least one specialization in-game first, then use this tool.'
    );
  }
  if (!data.progression.point_pools) data.progression.point_pools = {};
  data.progression.point_pools.specializationtokenpool = 700;
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('All Specializations unlocked and maxed out!');
  stageEpilogueMission(); // Stage epilogue mission to ensure specialization system is unlocked.
}

/**
 * Sets the character to maximum level.
 */
function setCharacterToMaxLevel() {
  let level = typeof MAX_LEVEL === 'number' ? MAX_LEVEL : 50;
  setCharacterLevel(level);
}

/**
 * Sets the character level to a specified value.
 * Also calculates and updates experience points accordingly.
 * @param {number} level - The target character level
 */
function setCharacterLevel(level) {
  const data = getYamlDataFromEditor();
  if (!data || !data.state || !data.state.experience) return;
  const idx = data.state.experience.findIndex((exp) => exp.type === 'Character');
  if (idx === -1) {
    console.warn('Character experience entry not found.');
    alert('Character experience entry not found in save data.');
    return;
  }

  let xp =
    typeof CHARACTER_LEVEL_XP === 'object' && CHARACTER_LEVEL_XP[level]
      ? CHARACTER_LEVEL_XP[level]
      : calculateCharacterXp(level);

  data.state.experience[idx].level = level;
  data.state.experience[idx].points = xp;

  data.progression.point_pools = data.progression.point_pools || {};
  data.progression.point_pools.characterprogresspoints = level - 1;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info(`Set character level to ${level} (XP: ${xp})`);
}

/**
 * Generates a RFC4122 version 4 compliant UUID.
 * Used for character identification when changing classes.
 * @returns {string} A new UUID
 */
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
  console.info(`Set character class: ${className}`);
}

function setMaxSDU() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // Ensure progression structures exist
  data.progression = data.progression || {};
  data.progression.graphs = data.progression.graphs || [];
  data.progression.point_pools = data.progression.point_pools || {};

  // Define the SDU upgrades graph as in the sample
  const points = [5, 10, 20, 30, 50, 80, 120, 235];
  const upgrades = [
    { prefix: 'Ammo_Pistol', levels: 7 },
    { prefix: 'Ammo_SMG', levels: 7 },
    { prefix: 'Ammo_AR', levels: 7 },
    { prefix: 'Ammo_SG', levels: 7 },
    { prefix: 'Ammo_SR', levels: 7 },
    { prefix: 'Backpack', levels: 8 },
    { prefix: 'Bank', levels: 8 },
    { prefix: 'Lost_Loot', levels: 8 },
  ];
  const nodes = upgrades.flatMap(({ prefix, levels }) =>
    Array.from({ length: levels }, (_, i) => ({
      name: `${prefix}_${String(i + 1).padStart(2, '0')}`,
      points_spent: points[i],
    }))
  );
  const sduGraph = {
    name: 'sdu_upgrades',
    group_def_name: 'Oak2_GlobalProgressGraph_Group',
    nodes,
  };

  // Replace existing sdu_upgrades graph if present, otherwise add it
  const existingIdx = data.progression.graphs.findIndex((g) => g.name === 'sdu_upgrades');
  if (existingIdx !== -1) {
    data.progression.graphs[existingIdx] = sduGraph;
  } else {
    data.progression.graphs.push(sduGraph);
  }

  // Calculate total points to reflect in echotokenprogresspoints
  const totalPoints = sduGraph.nodes.reduce((acc, n) => acc + (n.points_spent || 0), 0);
  const oldPoints = data.progression.point_pools.echotokenprogresspoints || 0;
  data.progression.point_pools.echotokenprogresspoints = Math.max(oldPoints, totalPoints);

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info(
    `Inserted/Replaced sdu_upgrades graph and set echotokenprogresspoints: ${oldPoints} -> ${data.progression.point_pools.echotokenprogresspoints}`
  );
}

// Purely for convenience; maxes out both currencies & all ammo.
function maxCurrency() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.state = data.state || {};
  data.state.currencies = data.state.currencies || {};
  data.state.currencies.cash = 2147483647;
  data.state.currencies.eridium = 2147483647;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('Currencies maxed out');
}

function maxAmmo() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.state = data.state || {};
  data.state.ammo = {
    assaultrifle: 1260,
    pistol: 900,
    shotgun: 220,
    smg: 1620,
    sniper: 190,
    repkit: 10,
  };

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info('Ammo maxed out');
}

// Runs a best-effort sequence to unlock / max most things in a character save.
function unlockMaxEverything() {
  // Call every non-profile mutation function in a reasonable order.

  try {
    // Ammo & Currency
    if (typeof maxAmmo === 'function') maxAmmo();
    if (typeof maxCurrency === 'function') maxCurrency();

    // Exploration / discovery
    if (typeof clearMapFog === 'function') clearMapFog();
    if (typeof discoverAllLocations === 'function') discoverAllLocations();

    // Collectibles / counters
    if (typeof completeAllCollectibles === 'function') completeAllCollectibles();
    if (typeof completeAllAchievements === 'function') completeAllAchievements();

    // Missions / progression
    if (typeof completeAllSafehouseMissions === 'function') completeAllSafehouseMissions();
    if (typeof completeAllMissions === 'function') completeAllMissions();
    if (typeof completeAllStoryMissions === 'function') completeAllStoryMissions();
    if (typeof stageEpilogueMission === 'function') stageEpilogueMission();

    // SDU / progression graphs
    if (typeof setMaxSDU === 'function') setMaxSDU();
    if (typeof updateSDUPoints === 'function') updateSDUPoints();

    // Unlocks / systems
    if (typeof unlockVaultPowers === 'function') unlockVaultPowers();
    if (typeof unlockUVHMode === 'function') unlockUVHMode();
    if (typeof unlockAllHoverDrives === 'function') unlockAllHoverDrives();
    if (typeof unlockAllSpecialization === 'function') unlockAllSpecialization();

    // Challenges and counters (these are many; the master function calls the grouped helper)
    if (typeof completeAllChallenges === 'function') completeAllChallenges();

    // Character progression
    if (typeof setCharacterToMaxLevel === 'function') setCharacterToMaxLevel();

    console.info('Unlock / Max Everything applied');
  } catch (e) {
    console.error('unlockMaxEverything failed:', e);
    alert('Failed to apply Unlock / Max Everything: ' + e);
  }
}
