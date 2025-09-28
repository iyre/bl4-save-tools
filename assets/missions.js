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

function loadMissionsets(b64) {
  const compressed = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const yamlBytes = pako.inflate(compressed);
  const yamlText = new TextDecoder().decode(yamlBytes);
  return jsyaml.load(yamlText);
}

// Extract missionsets of a given type (e.g. "story", "activity")
function getMissionsetsOfType(type) {
  const prefix = MISSION_PREFIXES[type];
  if (!prefix) throw new Error(`Unknown mission type: ${type}`);
  const allMissions = loadMissionsets(MISSIONSETS_COMPRESSED);
  const result = {};
  for (const key in allMissions) {
    if (key.startsWith(prefix)) {
      result[key] = allMissions[key];
    }
  }
  return result;
}

// Merge missionsets of a given type into save data
function mergeMissionsetsOfType(type) {
  const missionsets = getMissionsetsOfType(type);
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  if (!data.missions) data.missions = {};
  if (!data.missions.local_sets) data.missions.local_sets = {};
  const target = data.missions.local_sets;
  for (const key in missionsets) {
    target[key] = missionsets[key];
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
