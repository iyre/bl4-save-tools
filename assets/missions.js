/**
 * Mission system management module.
 * Handles mission state manipulation including:
 * - Story mission completion
 * - Side mission tracking
 * - Activity and zone mission management
 * - Mission set merging and updates
 */


/**
 * Extracts all mission sets with a specific prefix from the mission data.
 * @param {string} prefix - The prefix of the missionset key to extract (e.g., 'missionset_main')
 * @returns {Object} Object containing filtered mission sets
 */
function getMissionsetsWithPrefix(prefix) {
  const result = {};
  for (const key in MISSIONSETS) {
    if (key.startsWith(prefix)) {
      result[key] = MISSIONSETS[key];
    }
  }
  return result;
}

// Merge missionsets with a specific prefix into the save file
function mergeMissionsetsWithPrefix(prefix) {
  const data = getYamlDataFromEditor();
  if (!data) return;
  const filteredMissionsets = getMissionsetsWithPrefix(prefix);

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
  mergeMissionsetsWithPrefix('missionset_');
  stageEpilogueMission();
  if (typeof setStoryValues === 'function') setStoryValues();
  if (typeof openAllVaultDoors === 'function') openAllVaultDoors();
  if (typeof discoverSafehouseLocations === 'function') discoverSafehouseLocations();
}

function completeAllStoryMissions() {
  mergeMissionsetsWithPrefix('missionset_main_');
  stageEpilogueMission();
  if (typeof setStoryValues === 'function') setStoryValues();
}

// Missionset keywords that indicate DLC content rather than base game content.
// missionset keys for DLC missions don't share a single common prefix (they're
// mixed into missionset_main_/side_/micro_/zoneactivity_ alongside base game
// content), so DLC sets are identified by these codename/keyword substrings
// instead. This list may need to be updated as new DLCs are added.
const DLC_MISSIONSET_KEYWORDS = ['_dlc', '_banjo', '_cello', '_cowbell', '_harp', '_tuba', '_viola', '_harmonica'];

function isBaseGameMissionset(key) {
  return DLC_MISSIONSET_KEYWORDS.every((keyword) => !key.includes(keyword));
}

// Merge all base-game (non-DLC) missionsets into the save file
function mergeBaseGameMissionsets() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  if (!data.missions) data.missions = {};
  if (!data.missions.local_sets) data.missions.local_sets = {};
  const target = data.missions.local_sets;
  for (const key in MISSIONSETS) {
    if (key.startsWith('missionset_') && isBaseGameMissionset(key)) {
      target[key] = MISSIONSETS[key];
    }
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function completeAllBaseGameMissions() {
  mergeBaseGameMissionsets();
  stageEpilogueMission();

  if (typeof setStoryValues === 'function') setStoryValues();
  if (typeof openAllVaultDoors === 'function') openAllVaultDoors();
  if (typeof discoverSafehouseLocations === 'function') discoverSafehouseLocations();
  if (typeof completeAllSafehouseMissions === 'function') completeAllSafehouseMissions(false);
}

function completeAllSafehouseMissions(includeDlc = true) {
  mergeMissionsetsWithPrefix('missionset_zoneactivity_safehouse');
  mergeMissionsetsWithPrefix('missionset_zoneactivity_silo');
  if (includeDlc) {
    mergeMissionsetsWithPrefix('missionset_harmonica_zoneactivity_safehouse');
  }
  if (typeof discoverSafehouseLocations === 'function') discoverSafehouseLocations();
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
