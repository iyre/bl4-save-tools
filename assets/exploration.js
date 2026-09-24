/**
 * World exploration and map discovery system module.
 * Handles:
 * - Map fog of war clearing
 * - World and region visit tracking
 * - Location discovery system
 * - Map data compression and storage
 */

const levelnames = [
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
  'Raid1_P',
  'Banjo_P',
  'Cello_P',
  'Cowbell_P',
  'VaultoftheDamned_P',
  'Raid2_P',
  'Mandolin1_P',
  'Mandolin_MissionCoS_P',
  'Mandolin_CoS_P',
  'Harp_P',
  'Tuba_P',
  'Viola_P',
  'Viola_ElpisVile_P',
  'Harmonica_P',
  'VolcanoFortress_P',
];

/**
 * Returns the discovery data for 'pc' (map fog) or 'pg' (discovered locations), creating it if missing.
 * Profile saves keep it under domains.local as gbx_discovery_*_shared. Character saves keep it at
 * the root as gbx_discovery_*, which the game only uses when state.using_shared_progression is false.
 * @param {Object} data - The parsed save file data
 * @param {'pc'|'pg'} kind
 * @returns {Object}
 */
function getDiscoveryData(data, kind) {
  if (!isProfileSave) {
    const key = `gbx_discovery_${kind}`;
    data[key] = data[key] || {};
    return data[key];
  }
  const key = `gbx_discovery_${kind}_shared`;
  data.domains = data.domains || {};
  data.domains.local = data.domains.local || {};
  data.domains.local[key] = data.domains.local[key] || {};
  return data.domains.local[key];
}

/**
 * Clears the fog of war from all game maps.
 * Updates fog of discovery (FOD) data for all game levels using zlib compression.
 * Also marks all worlds and regions as visited.
 */
// zlib + base64 of a 128x128 fog grid: all 0xFF bytes (revealed) or all 0x00 bytes (fogged)
const FOD_REVEALED = 'eJztwTEBAAAAwqD+qWcMH6AAAAAAAAAAAAAAAAAAAACAtwGw2cOy';
const FOD_FOGGED = 'eJztwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAACAtwFAAAAB';

function clearMapFog() {
  return setMapFog(FOD_REVEALED);
}

function addMapFog() {
  return setMapFog(FOD_FOGGED);
}

function setMapFog(foddata) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const commonFields = {
    foddimensionx: 128,
    foddimensiony: 128,
    compressiontype: 'Zlib',
    foddata,
  };

  const pc = getDiscoveryData(data, 'pc');

  // Update foddatas: add missing levelnames, and refresh foddata on every entry
  pc.foddatas = pc.foddatas || [];
  for (const levelname of levelnames) {
    const idx = pc.foddatas.findIndex((e) => e.levelname === levelname);
    if (idx === -1) {
      pc.foddatas.push({ levelname, ...commonFields });
    }
  }
  for (const entry of pc.foddatas) {
    entry.foddata = commonFields.foddata;
  }
  // Seen lists are always at the root gbx_discovery_pc, in both save types
  data.gbx_discovery_pc = data.gbx_discovery_pc || {};
  setWorldsSeen(data.gbx_discovery_pc, foddata === FOD_REVEALED);

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

// Regions marked as seen in discovery metrics alongside the levels above
const regionnames = [
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
  'Loader',
  'Banjo',
  'Raid1',
  'Cello',
  'Cowbell',
  'Cowbell_CrookedTeeth',
  'Cowbell_Speakeasy',
  'Cowbell_BloodstainedHollow',
  'Cowbell_WindsweptWastes',
  'Cowbell_Feuermann',
  'Cowbell_VaultOfTheDamned',
  'Raid2',
  'Mandolin',
  'Mandolin_CoS',
  'Mandolin_PrivateDick',
  'Tuba',
  'Harp',
  'Viola',
  'Viola_ElpisVile',
  'Harmonica',
  'Harmonica_VinechokedCanopy',
  'Harmonica_BagheeraRange',
  'Harmonica_UpperCrust',
  'Harmonica_LavaField',
  'Harmonica_VolcanoFortress',
];

/**
 * Adds or removes every known level and region in the seen lists of the discovery metrics.
 * Entries not in levelnames/regionnames are left alone.
 * @param {Object} pc - The root gbx_discovery_pc (not the profile's _shared copy)
 * @param {boolean} seen
 */
function setWorldsSeen(pc, seen) {
  pc.metrics = pc.metrics || {};
  const update = (key, names) => {
    const list = pc.metrics[key] || [];
    const known = new Set(names);
    const kept = list.filter((name) => !known.has(name));
    pc.metrics[key] = seen ? [...kept, ...names] : kept;
  };
  update('hasseenworldlist', levelnames);
  update('hasseenregionlist', regionnames);
}

/**
 * Adds locations to the discovered locations list.
 * @param {Object} data - The parsed save file data
 * @param {string[]} locationSubstrings - Array of substrings to match against location names
 */
function addDiscoveredLocations(data, locationSubstrings) {
  const pg = getDiscoveryData(data, 'pg');
  let existingBlob = pg.dlblob || '';
  let existing = existingBlob.split(/:\d:/).filter(Boolean);

  let merged = new Set(existing);
  for (const line of LOCATIONS) {
    if (locationSubstrings.some((substr) => line.includes(substr))) {
      merged.add(line);
    }
  }

  pg.dlblob = Array.from(merged).join(':2:') + ':2:';
}

/**
 * Discovers all locations in the game world.
 * Adds all location types including activities, safehouses, and points of interest.
 * Also completes achievement counters for location discovery.
 */
function discoverAllLocations() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const locationSubstrings = [''];
  addDiscoveredLocations(data, locationSubstrings);

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function undiscoverAllLocations() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const pg = getDiscoveryData(data, 'pg');
  if (!pg.dlblob) return 'No discovered locations found.';

  const known = new Set(LOCATIONS);
  const existing = pg.dlblob.split(/:\d:/).filter(Boolean);
  const kept = existing.filter((line) => !known.has(line));
  pg.dlblob = kept.length ? kept.join(':2:') + ':2:' : '';

  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Removed ${existing.length - kept.length} discovered locations.`;
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
