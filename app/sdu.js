function updateSDUPoints() {
  const ACTIVITY_POINTS = 40;
  const ACTIVITIES = [
    'missionset_zoneactivity_crawler',
    'missionset_zoneactivity_drillsite',
    'missionset_zoneactivity_mine',
    'missionset_zoneactivity_orderbunker',
    'missionset_zoneactivity_safehouse',
    'missionset_zoneactivity_silo',
  ];
  const COLLECTIBLES = {
    'propaspeakers': 20,
    'capsules':      15,
    'evocariums':    15,
    'augurshrines':  10,
    'caches':        10,
    'safes':         10,
    'vaultsymbols':   5,
  };

  // Get YAML from editor
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  let total = 0;

  // Activities
  const mission_sets = (((data.missions || {}).local_sets) || {});
  for (const activity of ACTIVITIES) {
    const missions = ((mission_sets[activity] || {}).missions) || {};
    let completed_activities = 0;
    for (const m of Object.values(missions)) {
      if (typeof m === 'object' && m.status === 'completed') {
        completed_activities += 1;
      }
    }
    total += completed_activities * ACTIVITY_POINTS;
  }

  // Collectibles
  const collectibles = (((((data.stats || {}).openworld) || {}).collectibles) || {});
  for (const key in COLLECTIBLES) {
    if (collectibles.hasOwnProperty(key)) {
      if (typeof collectibles[key] === 'object') {
        total += Object.keys(collectibles[key]).length * COLLECTIBLES[key];
      } else {
        total += COLLECTIBLES[key];
      }
    }
  }

  // Write value to progression.point_pools.echotokenprogresspoints
  if (!data.progression) data.progression = {};
  if (!data.progression.point_pools) data.progression.point_pools = {};
  data.progression.point_pools.echotokenprogresspoints = total;

  // Update editor with new YAML
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  alert("Echo Token Points updated to " + total + "!");
}
