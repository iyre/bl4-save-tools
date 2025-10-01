// Functions for manipulating exploration & discovery data

function clearMapFog() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // Levelnames and common fields
  const levelnames = [
    'Intro_P',
    'World_P',
    'Vault_Grasslands_P',
    'Fortress_Grasslands_P',
    'Vault_ShatteredLands_P',
    'Fortress_Shatteredlands_P',
    'Vault_Mountains_P',
    'Fortress_Mountains_P',
    'ElpisElevator_P',
    'Elpis_P',
    'UpperCity_P',
  ];
  const commonFields = {
    foddimensionx: 128,
    foddimensiony: 128,
    compressiontype: 'Zlib',
    foddata: 'eJztwTEBAAAAwqD+qWcMH6AAAAAAAAAAAAAAAAAAAACAtwGw2cOy',
  };

  // Ensure gbx_discovery_pc exists
  data.gbx_discovery_pc = data.gbx_discovery_pc || {};
  let gbx = data.gbx_discovery_pc;

  // Update foddatas: replace or append
  gbx.foddatas = gbx.foddatas || [];
  for (const levelname of levelnames) {
    const newEntry = { levelname, ...commonFields };
    const idx = gbx.foddatas.findIndex((e) => e.levelname === levelname);
    if (idx !== -1) {
      gbx.foddatas[idx] = newEntry;
    } else {
      gbx.foddatas.push(newEntry);
    }
  }

  // Set visited worlds/regions
  visitAllWorlds(data);

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  showPresetNotification();
}

// not sure what these control, but they're related to map discovery
function visitAllWorlds(data) {
  const worldlist = [
    'Intro_P',
    'World_P',
    'Fortress_Grasslands_P',
    'Vault_Grasslands_P',
    'Fortress_Shatteredlands_P',
    'Vault_ShatteredLands_P',
    'Fortress_Mountains_P',
    'Vault_Mountains_P',
    'ElpisElevator_P',
    'Elpis_P',
    'UpperCity_P',
  ];
  const regionlist = [
    'KairosGeneric',
    'grasslands_Prison',
    'grasslands_RegionA',
    'grasslands_RegionB',
    'grasslands_RegionC',
    'grasslands_RegionD',
    'grasslands_RegionE',
    'Grasslands_Fortress',
    'Grasslands_Vault',
    'shatteredlands_RegionA',
    'shatteredlands_RegionB',
    'shatteredlands_RegionC',
    'shatteredlands_RegionD',
    'shatteredlands_RegionE',
    'shatteredlands_Fortress',
    'shatteredlands_Vault',
    'mountains_RegionA',
    'mountains_RegionB',
    'mountains_RegionC',
    'mountains_RegionD',
    'mountains_RegionE',
    'Mountains_Fortress',
    'Mountains_Vault',
    'elpis_elevator',
    'elpis',
    'city_RegionA',
    'city_RegionB',
    'city_RegionC',
    'city_Upper',
  ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  // Ensure gbx_discovery_pc exists
  data.gbx_discovery_pc = data.gbx_discovery_pc || {};
  let gbx = data.gbx_discovery_pc;
  gbx.metrics = gbx.metrics || {};

  gbx.metrics.hasseenworldlist = gbx.metrics.hasseenworldlist || [];
  for (const w of worldlist) {
    if (!gbx.metrics.hasseenworldlist.includes(w)) {
      gbx.metrics.hasseenworldlist.push(w);
    }
  }

  gbx.metrics.hasseenregionlist = gbx.metrics.hasseenregionlist || [];
  for (const r of regionlist) {
    if (!gbx.metrics.hasseenregionlist.includes(r)) {
      gbx.metrics.hasseenregionlist.push(r);
    }
  }
  gbx.metrics.hasseenregionlist.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function addDiscoveredLocations(data, locationSubstrings) {
  data.gbx_discovery_pg = data.gbx_discovery_pg || {};
  let existingBlob = data.gbx_discovery_pg.dlblob || '';
  let existing = existingBlob.split(/:\d:/).filter(Boolean);

  let merged = new Set(existing);
  for (const line of LOCATIONS) {
    if (locationSubstrings.some((substr) => line.includes(substr))) {
      merged.add(line);
    }
  }

  data.gbx_discovery_pg.dlblob = Array.from(merged).join(':2:') + ':2:';
}

function discoverAllLocations() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  // PoAActor = activities; couldnt find a pattern to get "just safehouses" or similar. add everything for now.
  const locationSubstrings = [''];
  addDiscoveredLocations(data, locationSubstrings);

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  showPresetNotification();
}
