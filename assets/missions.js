// Functions for manipulating mission data

// Map of friendly mission type names to missionset key prefixes
const MISSION_PREFIXES = {
  all:       'missionset_',
  story:     'missionset_main_',
  micro:     'missionset_micro_',
  side:      'missionset_side_',
  vault:     'missionset_vault_',
  activity:  'missionset_zoneactivity_',
  crawler:   'missionset_zoneactivity_crawler',
  drillsite: 'missionset_zoneactivity_drillsite',
  mine:      'missionset_zoneactivity_mine',
  bunker:    'missionset_zoneactivity_orderbunker',
  safehouse: 'missionset_zoneactivity_safehouse',
  silo:      'missionset_zoneactivity_silo',
};

// Extract missionsets of a given type (e.g. "story", "activity")
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
  updateSDUPoints();
  showPresetNotification();
}

function completeAllStoryMissions() {
  mergeMissionsetsOfType('story');
  showPresetNotification();
}

function completeAllSafehouseMissions() {
  mergeMissionsetsOfType('safehouse');
  mergeMissionsetsOfType('silo');
  updateSDUPoints();
  showPresetNotification();
}
