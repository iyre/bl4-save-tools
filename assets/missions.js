/**
 * Mission system management module.
 * Handles mission state manipulation including:
 * - Story mission completion
 * - Side mission tracking
 * - Activity and zone mission management
 * - Mission set merging and updates
 */

/**
 * Maps user-friendly mission type names to their internal missionset prefixes.
 * Used for filtering and identifying different types of missions in the save file.
 * @const {Object<string, string>}
 */
const MISSION_PREFIXES = {
  all: 'missionset_',
  story: 'missionset_main_',
  micro: 'missionset_micro_',
  side: 'missionset_side_',
  vault: 'missionset_vault_',
  activity: 'missionset_zoneactivity_',
  crawler: 'missionset_zoneactivity_crawler',
  drillsite: 'missionset_zoneactivity_drillsite',
  mine: 'missionset_zoneactivity_mine',
  bunker: 'missionset_zoneactivity_orderbunker',
  safehouse: 'missionset_zoneactivity_safehouse',
  silo: 'missionset_zoneactivity_silo',
};

/**
 * Extracts all mission sets of a specific type from the mission data.
 * @param {string} type - The type of missions to extract (e.g., 'story', 'activity')
 * @returns {Object} Object containing filtered mission sets
 * @throws {Error} If the mission type is unknown
 */
function getMissionsetsOfType(type) {
  const prefix = MISSION_PREFIXES[type];
  if (!prefix) throw new Error(`Unknown mission type: ${type}`);

  const result = {};
  for (const key in MISSIONSETS) {
    if (key.startsWith(prefix)) {
      result[key] = MISSIONSETS[key];
    }
  }
  return result;
}

// Merge missionsets of a given type into save data
function mergeMissionsetsOfType(type) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const filteredMissionsets = getMissionsetsOfType(type);

  if (!data.missions) data.missions = {};
  if (!data.missions.local_sets) data.missions.local_sets = {};
  const target = data.missions.local_sets;
  for (const key in filteredMissionsets) {
    target[key] = filteredMissionsets[key];
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function completeAllMissions() {
  mergeMissionsetsOfType('all');
  stageEpilogueMission();
  if (typeof updateSDUPoints === 'function') updateSDUPoints();
}

function completeAllStoryMissions() {
  mergeMissionsetsOfType('story');
  stageEpilogueMission();
  if (typeof setStoryValues === 'function') setStoryValues();
}

function completeAllSafehouseMissions() {
  mergeMissionsetsOfType('safehouse');
  mergeMissionsetsOfType('silo');
  if (typeof discoverSafehouseLocations === 'function') discoverSafehouseLocations();
  if (typeof updateSDUPoints === 'function') updateSDUPoints();
}

/**
 * Stages the epilogue mission in a specific state to unlock specializations.
 * This is required when completing the story via save editing, as it ensures
 * the proper game state for specialization system unlocking.
 * Sets up all necessary objectives and flags for the city epilogue mission.
 */
function stageEpilogueMission() {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert('Failed to parse YAML: ' + e);
    return;
  }

  if (!data.missions) data.missions = {};
  if (!data.missions.local_sets) data.missions.local_sets = {};

  // JSON version of the YAML missionset block
  data.missions.local_sets['missionset_main_cityepilogue'] = {
    missions: {
      mission_main_cityepilogue: {
        status: 'Active',
        cursorposition: 8,
        final: {
          inv_openportal_endstate: 'completed',
          phasedimensionentered_1st: true,
          defeat_arjay_endstate: 'completed',
          take_object_endstate: 'completed',
        },
        objectives: {
          entervault: { status: 'Completed_PostFinished' },
          defeat_arjay: { status: 'Completed_PostFinished' },
          entervault_todefeatarjay: {
            status: 'Deactivated_PostFinished',
          },
          explore_vault: { status: 'Completed_PostFinished' },
          lootchests: {
            status: 'Completed_PostFinished',
            updatecount: 4,
          },
          returntomoxxisbar: { status: 'Completed_Finishing' },
          speaktolilith: { status: 'Completed_PostFinished' },
          take_object: { status: 'Completed_PostFinished' },
          inv_readyforspeaktolilith: {
            status: 'Completed_PostFinished',
          },
          _lootchests_sub3: { status: 'Completed_PostFinished' },
          _lootchests_sub1: { status: 'Completed_PostFinished' },
          _lootchests_sub2: { status: 'Completed_PostFinished' },
          _lootchests_sub0: { status: 'Completed_PostFinished' },
          inv_playerarrivedatfinalplatform: {
            status: 'Completed_PostFinished',
          },
          inv_openportal: { status: 'Completed_PostFinished' },
          inv_interactwithrift: { status: 'Completed_PostFinished' },
        },
      },
    },
  };

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}
