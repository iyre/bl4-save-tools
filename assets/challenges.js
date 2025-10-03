// Functions for handling challenges

function completeUVHChallenges() {
  const COUNTERS = {
    mission_uvh_1a: 1,
    mission_uvh_1b: 1,
    mission_uvh_1c: 1,
    mission_uvh_2a: 1,
    mission_uvh_2b: 1,
    mission_uvh_2c: 1,
    mission_uvh_2d: 1,
    mission_uvh_3a: 1,
    mission_uvh_3b: 1,
    mission_uvh_3c: 1,
    mission_uvh_3d: 1,
    mission_uvh_4a: 1,
    mission_uvh_4b: 1,
    mission_uvh_4c: 1,
    mission_uvh_4d: 1,
    mission_uvh_5a: 1,
    mission_uvh_5b: 1,
    mission_uvh_5c: 1,
    uvh_1_finalchallenge: 1,
    uvh_2_finalchallenge: 1,
    uvh_3_finalchallenge: 1,
    uvh_4_finalchallenge: 1,
    uvh_5_finalchallenge: 1,
  };

  updateChallengeCounters(COUNTERS);
}

function completeCharacterChallenges() {}

function completeWorldChallenges() {}

function completeEconomicChallenges() {}

function completeElementalChallenges() {}

function completeWeaponChallenges() {}

function completeEquipmentChallenges() {}

function completeManufacturerChallenges() {
  const COUNTERS = {
    manufacturer_borg_criticalhits: 1,
    manufacturer_borg_multikills: 1,
    manufacturer_borg_underbarrel_kills: 1,
    manufacturer_borg_kills: 1,

    manufacturer_daedalus_multiloader_assault: 1,
    manufacturer_daedalus_multiloader_pistol: 1,
    manufacturer_daedalus_multiloader_shotgun: 1,
    manufacturer_daedalus_multiloader_smg: 1,
    manufacturer_daedalus_multiloader_sniper: 1,
    manufacturer_daedalus_underbarrel_kills: 1,
    manufacturer_daedalus_kills: 1,

    manufacturer_jakobs_grenadecrits: 1,
    manufacturer_jakobs_oneshot: 1,
    manufacturer_jakobs_quickdraw: 1,
    manufacturer_jakobs_ricochetkills: 1,
    manufacturer_jakobs_underbarrel_kills: 1,
    manufacturer_jakobs_kills: 1,

    manufacturer_maliwan_status_fire: 1,
    manufacturer_maliwan_status_cryo: 1,
    manufacturer_maliwan_status_corrosive: 1,
    manufacturer_maliwan_status_radiation: 1,
    manufacturer_maliwan_status_shock: 1,
    manufacturer_maliwan_underbarrel_kills: 1,
    manufacturer_maliwan_kills: 1,

    manufacturer_order_killorder: 1,
    manufacturer_order_fullcharge_kills: 1,
    manufacturer_order_halfcharge_kills: 1,
    manufacturer_order_oneshot_kills: 1,
    manufacturer_order_underbarrel_kills: 1,
    manufacturer_order_kills: 1,

    manufacturer_tediore_comboreload_kills: 1,
    manufacturer_tediore_emptyreload_kills: 1,
    manufacturer_tediore_fullreload_kills: 1,
    manufacturer_tediore_turretreload_kills: 1,
    manufacturer_tediore_underbarrel_kills: 1,
    manufacturer_tediore_kills: 1,

    manufacturer_torgue_grenade_kills: 1,
    manufacturer_torgue_impact_kills: 1,
    manufacturer_torgue_sticky_kills: 1,
    manufacturer_torgue_splash_kills: 1,
    manufacturer_torgue_underbarrel_kills: 1,
    manufacturer_torgue_kills: 1,

    manufacturer_vladof_bipod: 1,
    manufacturer_vladof_extrabarrel: 1,
    manufacturer_vladof_explosive_underbarrel: 1,
    manufacturer_vladof_shotgun_underbarrel: 1,
    manufacturer_vladof_kills: 1,
  };

  updateChallengeCounters(COUNTERS);
}

// Update counters according to input object
function updateChallengeCounters(counters) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.stats = data.stats || {};
  data.stats.challenge = data.stats.challenge || {};

  for (const [key, value] of Object.entries(counters)) {
    const prev = data.stats.challenge[key];
    if (prev === undefined || value > prev) {
      data.stats.challenge[key] = value;
    }
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  showPresetNotification();
}
