/**
 * World exploration and map discovery system module.
 * Handles:
 * - Map fog of war clearing
 * - World and region visit tracking
 * - Location discovery system
 * - Map data compression and storage
 */

/**
 * Clears the fog of war from all game maps.
 * Updates fog of discovery (FOD) data for all game levels using zlib compression.
 * Also marks all worlds and regions as visited.
 */
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
}

/**
 * Marks all worlds and regions as visited in the game's discovery metrics.
 * This affects map markers, fast travel points, and region completion tracking.
 * @param {Object} data - The parsed save file data
 */
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
  gbx.metrics.hasseenregionlist.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

/**
 * Adds locations to the player's discovered locations list.
 * @param {Object} data - The parsed save file data
 * @param {string[]} locationSubstrings - Array of substrings to match against location names
 */
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

/**
 * Discovers all locations in the game world.
 * Currently adds all possible location types including activities,
 * safehouses, and points of interest.
 */
function discoverAllLocations() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const locationSubstrings = [''];
  addDiscoveredLocations(data, locationSubstrings);

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function discoverSafehouseLocations() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const prefix = 'DLMD_World_P_PoAActor_UAID_';
  const locationSubstrings = SAFEHOUSE_SILO_LOCATIONS.map((id) => prefix + id);

  addDiscoveredLocations(data, locationSubstrings);

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

// POI marker suffixes for safehouses, silos, and towns. Prefixed with "DLMD_World_P_PoAActor_UAID_"
const SAFEHOUSE_SILO_LOCATIONS = [
  '02504100000113ED01_1588318775',
  '025041000001181202_1219939729',
  '0250410000015FED01_1875042151',
  '02504100000187D401_1882517809',
  '047C1619B44AA00302_1687647825',
  '04922658D4A72CD401_1798204775',
  '04922658D4A75EE201_1362582382',
  '04922658D4A791C201_1271147543',
  '089204DCF485770E02_1192963223',
  '089204DCF7EF120E02_2035944540',
  '089204DCF7EF92FA01_2135167885',
  '089204DCF7EFD0FA01_1541512767',
  '089204DCF7EFF40F02_1177657411',
  '14F6D87D57071BD501_1530198843',
  '14F6D87D570787D401_1419323791',
  '244BFE96422D31D401_2101065829',
  '244BFE96422DA2F901_1897336641',
  '244BFE96422DC5FC01_1346905034',
  '34CFF6FF1DA56FD601_1995548687',
  '5811224CB62827D501_1937969200',
  '5811224CB62835D501_1890737431',
  '907841CAD86511F801_1501116063',
  'B04F130572E120DB01_1153963055',
  'CC96E5191F743DD401_1223726776',
  'CC96E5191F74B8E601_1603838428',
  'CC96E5191F74D2D401_1997150008',
];
