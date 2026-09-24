/**
 * Character progression and advancement system module.
 * Handles:
 * - Echo points and SDU upgrades
 * - Character level and experience
 * - Specialization system unlocks
 * - Character class management
 * - Global unlock and max-out functionality
 */

/**
 * Updates Echo points based on completed activities and collectibles.
 * Points are awarded for:
 * - Completed zone activities (40 points each)
 * - Various collectible types with different point values
 * Only updates if the calculated total is higher than existing points.
 */
function updateEchoPoints() {
  const data = getYamlDataFromEditor();
  if (!data) return;
  // Ensure we're in a profile save
  if (!data.domains || !data.domains.local) return;

  const entries = data.domains.local.unlockables?.echo_upgrade_challenges?.entries || [];

  // entry names follow the format "echo_upgrade_challenges.<activity|collect>_<type>_<uniqueid>"
  const valueMap = {
    activity: 40,
    collect_propaspeakers: 20,
    collect_capsules: 15,
    collect_evocariums: 15,
    collect_shrines: 10,
    collect_caches: 10,
    collect_safes: 10,
    collect_vaultsymbols: 5,
  };

  let pointTotal = 0;
  for (const [type, value] of Object.entries(valueMap)) {
    const prefix = `echo_upgrade_challenges.${type}_`;
    const count = entries.filter(c => typeof c === 'string' && c.startsWith(prefix)).length;
    pointTotal += count * value;
  }

  // Ensure point_pools key exists
  data.domains.local = data.domains.local || {};
  data.domains.local.progression_shared = data.domains.local.progression_shared || {};
  data.domains.local.progression_shared.point_pools = data.domains.local.progression_shared.point_pools || {};
  // Write value to echotokenprogresspoints only if higher
  const oldPointTotal = data.domains.local.progression_shared.point_pools.echotokenprogresspoints || 0;
  if (pointTotal <= oldPointTotal) {
    console.log(
      `Not updating echotokenprogresspoints: current ${oldPointTotal} > calculated ${pointTotal}`
    );
    return;
  }
  data.domains.local.progression_shared.point_pools.echotokenprogresspoints = pointTotal;

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
  let level = typeof MAX_LEVEL === 'number' ? MAX_LEVEL : 60;
  setCharacterLevel(level);
}

/**
 * Turns shared progression on or off for a character save.
 * When off, the game reads map fog and discovered locations from the character save's root
 * (gbx_discovery_pc / gbx_discovery_pg) instead of the profile save.
 * Disabling only flips the flag; the game fills in the per-character data itself.
 * Enabling also removes the per-character data, which the game no longer uses.
 * @param {boolean} enabled
 */
function setSharedProgression(enabled) {
  const data = getYamlDataFromEditor();
  if (!data) return;
  if (isProfileSave) return;

  data.state = data.state || {};
  data.state.using_shared_progression = enabled;

  if (enabled) {
    // gbx_discovery_pc stays for seen worlds/regions; only the fog fields are per-character
    const pc = data.gbx_discovery_pc;
    if (pc) {
      delete pc.saveid;
      delete pc.fodsaveversion;
      delete pc.foddatas;
    }
    data.gbx_discovery_pg = null;
  }

  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Shared progression ${enabled ? 'enabled' : 'disabled'}.`;
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

  // Ensure we're in a profile save
  if (!data.domains || !data.domains.local) return;

  // Ensure progression structures exist
  data.domains.local = data.domains.local || {};
  data.domains.local.progression_shared = data.domains.local.progression_shared || {};
  data.domains.local.progression_shared.graphs = data.domains.local.progression_shared.graphs || [];
  data.domains.local.progression_shared.point_pools = data.domains.local.progression_shared.point_pools || {};

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
  const existingIdx = data.domains.local.progression_shared.graphs.findIndex((g) => g.name === 'sdu_upgrades');
  if (existingIdx !== -1) {
    data.domains.local.progression_shared.graphs[existingIdx] = sduGraph;
  } else {
    data.domains.local.progression_shared.graphs.push(sduGraph);
  }

  // Calculate total points to reflect in echotokenprogresspoints
  const totalPoints = sduGraph.nodes.reduce((acc, n) => acc + (n.points_spent || 0), 0);
  const oldPoints = data.domains.local.progression_shared.point_pools.echotokenprogresspoints || 0;
  const maxPoints = Math.max(oldPoints, totalPoints);
  data.domains.local.progression_shared.point_pools.echotokenprogresspoints = maxPoints;

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.info(
    `Inserted/Replaced sdu_upgrades graph and set echotokenprogresspoints: ${oldPoints} -> ${maxPoints}`
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

    // Collectibles / counters
    if (typeof completeAllCollectibles === 'function') completeAllCollectibles();
    if (typeof completeAllAchievements === 'function') completeAllAchievements();

    // Missions / progression
    if (typeof completeAllMissions === 'function') completeAllMissions();

    // Unlocks / systems
    if (typeof unlockPostgame === 'function') unlockPostgame();
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
