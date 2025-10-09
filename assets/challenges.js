/**
 * Challenge system implementation module.
 * Provides functions to complete various in-game challenges by setting
 * appropriate counter values in the save file. Challenges are grouped by
 * category (UVH, Combat, Character, etc.) with specific completion criteria.
 */

function completeAllChallenges() {
  completeUVHChallenges();
  completeCombatChallenges();
  completeCharacterChallenges();
  completeEnemiesChallenges();
  completeLootChallenges();
  completeWorldChallenges();
  completeEconomyChallenges();
  completeElementalChallenges();
  completeWeaponChallenges();
  completeEquipmentChallenges();
  completeManufacturerChallenges();
  completeLicensedPartsChallenges();
  completePhospheneChallenges();
}

function completeUVHChallenges() {
  const counters = {
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

  updateStatsCounters(counters);
}

function completeCombatChallenges() {
  const counters = {
    general_kill_enemies: 8000,
    general_kill_badass: 500,
    general_kill_crit: 2000,
    repkit_uses: 500,
    general_kill_melee: 2000,
    general_kill_groundpound: 200,
    general_kill_sliding: 1500,
    general_kill_dashing: 1000,
    general_kill_airborne: 1000,
    repkit_lifesteal: 900000,
    revivepartner: 200,
    secondwind: 200,
    secondwindbadassboss: 60,
  };

  updateStatsCounters(counters);
}

function completeCharacterChallenges() {
  const counters = {
    siren_death_tiered: 1000,
    siren_death_single: 1,
    siren_demonology_tiered: 1000,
    siren_demonology_single: 1,
    siren_duplicate_tiered: 1000,
    siren_duplicate_single: 1,
    siren_levelup: 50,

    exo_autolock_tiered: 1000,
    exo_autolock_single: 1,
    exo_buster_tiered: 1000,
    exo_buster_single: 1,
    exo_heavyarms_tiered: 1000,
    exo_heavyarms_single: 1,
    exo_levelup: 50,

    gravitar_terminal_tiered: 1000,
    gravitar_terminal_single: 1,
    gravitar_stasis_tiered: 1000,
    gravitar_stasis_single: 1,
    gravitar_exodus_tiered: 1000,
    gravitar_exodus_single: 1,
    gravitar_levelup: 50,

    paladin_cybernetics_tiered: 1000,
    paladin_cybernetics_single: 1,
    paladin_vengeance_tiered: 1000,
    paladin_vengeance_single: 1,
    paladin_weaponmaster_tiered: 1000,
    paladin_weaponmaster_single: 1,
    paladin_levelup: 50,
  };

  updateStatsCounters(counters);
}

function completeEnemiesChallenges() {
  const counters = {
    killenemyarmy_bandits: 5000,
    killenemytype_psycho: 1500,
    killenemytype_guntoter: 1250,
    killenemytype_splice: 750,
    killenemytype_meathead: 300,
    killenemytype_phalanx: 250,
    killenemyarmy_creatures: 4500,
    killenemytype_cat: 1500,
    killenemytype_bat: 500,
    killenemytype_beast: 750,
    killenemytype_creep: 750,
    killenemytype_pangolin: 750,
    killenemytype_thresher: 750,
    killenemyarmy_order: 4000,
    killenemytype_grunt: 1500,
    killenemytype_soldier: 1500,
    killenemytype_striker: 1500,
    killenemytype_drone: 350,
    killenemytype_leader: 750,
    killenemytype_brute: 600,
    general_kill_corrupted: 200,
  };

  updateStatsCounters(counters);
}

function completeLootChallenges() {
  const counters = {
    loot_anylootable: 2500,
    loot_redchest: 250,
    getcash: 3000000,
    geteridium: 10000,
    loot_whites: 200,
    loot_greens: 200,
    loot_blues: 150,
    loot_purples: 75,
    loot_legendaries: 25,
    loot_weapons: 500,
    loot_gadgets: 200,
    loot_shields: 200,
    loot_repkits: 200,
    loot_classmods: 200,
    loot_enhancements: 200,
  };

  updateStatsCounters(counters);
}

// Doesn't complete Timekeeper's Oath main mission
function completeWorldChallenges() {
  const counters = {
    '10_worldevents_colosseum': 1,
    '11_worldevents_airship': 1,
    '12_worldevents_meteor': 1,
    '24_missions_side': 98,
  };
  updateStatsCounters(counters, 'achievements');

  const data = getYamlDataFromEditor();
  if (!data) return;

  // fish counter
  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.misc = data.stats.openworld.misc || {};
  const prevFish = data.stats.openworld.misc.fish;
  if (prevFish === undefined || 50 > prevFish) {
    data.stats.openworld.misc.fish = 50;
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function completeEconomyChallenges() {
  const counters = {
    economy_maxheld_cash: 1,
    economy_maxheld_morecash: 1,
    economy_upgrade_inventory: 1,
    economy_upgrade_inventory_all: 1,
    economy_sellloot: 500,
    economy_firmware_set: 1,
  };

  updateStatsCounters(counters);
}

function completeElementalChallenges() {
  const counters = {
    kill_elemental_fire: 2500,
    kill_elemental_shock: 2000,
    kill_elemental_corrosive: 1600,
    kill_elemental_radiation: 2500,
    kill_elemental_cryo: 1000,
    kill_2_status: 5,
  };

  updateStatsCounters(counters);
}

function completeWeaponChallenges() {
  const counters = {
    pistol_kill: 2000,
    pistol_kill_secondwind: 75,
    pistol_hit_crit: 5000,
    pistol_kill_crit: 750,
    pistol_kill_scoped: 750,
    pistol_kill_gliding: 400,

    smg_kill: 2000,
    smg_kill_secondwind: 75,
    smg_hit_crit: 10000,
    smg_kill_crit: 1000,
    smg_kill_dashing: 1500,
    smg_kill_sliding: 750,

    assault_kill: 2500,
    assault_kill_secondwind: 75,
    assault_hit_crit: 7500,
    assault_kill_crit: 1000,
    assault_kill_scoped: 1500,
    assault_kill_crouched: 500,

    shotgun_kill: 2000,
    shotgun_kill_secondwind: 75,
    shotgun_hit_crit: 5000,
    shotgun_kill_crit: 750,
    shotgun_kill_sliding: 1000,
    shotgun_kill_dashing: 1000,
    shotgun_kill_close: 1500,
    shotgun_kill_distant: 600,
    shotgun_bigshot: 1,

    sniper_kill: 2000,
    sniper_kill_secondwind: 75,
    sniper_hit_crit: 4500,
    sniper_kill_crit: 750,
    sniper_kill_distant: 1000,
    sniper_kill_oneshot: 150,
    sniper_kill_unaware: 300,
    sniper_kill_unscoped: 200,
    sniper_bigshot: 1,
  };

  updateStatsCounters(counters);
}

function completeEquipmentChallenges() {
  const counters = {
    killenemy_grenade: 1000,
    killenemy_grenade_multikill: 300,
    killenemy_grenade_mirv: 400,
    killenemy_grenade_artillery: 450,
    killenemy_grenade_lingering: 300,
    killenemy_grenade_singularity: 500,
    killenemy_grenade_amp: 300,

    shield_take_damage: 2000000,
    shield_kills: 750,
    shield_pickup_boosters: 1000,
    shield_pickup_shards: 1000,
    shield_kills_nova: 200,
    shield_kills_reflect: 200,
    shield_absorb_ammo: 5000,
    shield_kills_amp: 500,

    killenemy_heavy_vladof: 250,
    killenemy_heavy_vladof_multikill: 100,
    killenemy_heavy_maliwan: 350,
    killenemy_heavy_maliwan_bigshot: 1,
    killenemy_heavy_torgue: 300,
    killenemy_heavy_torgue_directhit: 100,
    killenemy_heavy_borg: 400,
    killenemy_heavy_borg_multikill: 100,

    repkit_healself: 400000,
    repkit_kills: 250,
    repkit_healothers: 400000,
  };

  updateStatsCounters(counters);
}

function completeManufacturerChallenges() {
  const counters = {
    manufacturer_jakobs_kills: 2000,
    manufacturer_jakobs_underbarrel_kills: 175,
    manufacturer_jakobs_ricochetkills: 150,
    manufacturer_jakobs_oneshot: 500,
    manufacturer_jakobs_quickdraw: 350,
    manufacturer_jakobs_grenadecrits: 400,

    manufacturer_daedalus_kills: 2000,
    manufacturer_daedalus_underbarrel_kills: 150,
    manufacturer_daedalus_multiloader_pistol: 500,
    manufacturer_daedalus_multiloader_smg: 750,
    manufacturer_daedalus_multiloader_assault: 600,
    manufacturer_daedalus_multiloader_shotgun: 400,
    manufacturer_daedalus_multiloader_sniper: 400,

    manufacturer_vladof_kills: 2000,
    manufacturer_vladof_extrabarrel: 750,
    manufacturer_vladof_explosive_underbarrel: 175,
    manufacturer_vladof_bipod: 750,
    manufacturer_vladof_shotgun_underbarrel: 150,

    manufacturer_maliwan_kills: 2000,
    manufacturer_maliwan_underbarrel_kills: 175,
    manufacturer_maliwan_status_fire: 750,
    manufacturer_maliwan_status_shock: 750,
    manufacturer_maliwan_status_corrosive: 400,
    manufacturer_maliwan_status_radiation: 400,
    manufacturer_maliwan_status_cryo: 750,

    manufacturer_tediore_kills: 1500,
    manufacturer_tediore_underbarrel_kills: 150,
    manufacturer_tediore_emptyreload_kills: 750,
    manufacturer_tediore_fullreload_kills: 600,
    manufacturer_tediore_comboreload_kills: 200,
    manufacturer_tediore_turret_kills: 500,

    manufacturer_torgue_kills: 1300,
    manufacturer_torgue_underbarrel_kills: 125,
    manufacturer_torgue_splash_kills: 600,
    manufacturer_torgue_sticky_kills: 750,
    manufacturer_torgue_impact_kills: 750,
    manufacturer_torgue_grenade_kills: 400,

    manufacturer_borg_kills: 1300,
    manufacturer_borg_underbarrel_kills: 125,
    manufacturer_borg_criticalhits: 1500,
    manufacturer_borg_multikills: 450,

    manufacturer_order_kills: 1500,
    manufacturer_order_underbarrel_kills: 125,
    manufacturer_order_halfcharge_kills: 600,
    manufacturer_order_fullcharge_kills: 750,
    manufacturer_order_oneshot_kills: 500,
    manufacturer_order_killorder: 750,
  };

  updateStatsCounters(counters);
}

function completeLicensedPartsChallenges() {
  const counters = {
    spareparts_atlas_tracker_pucks: 350,
    spareparts_atlas_tracker_grenades: 600,
    spareparts_cov_overheated: 250,
    spareparts_cov_not_overheated: 600,
    spareparts_hyperion_amp_shield: 150,
    spareparts_hyperion_absorb_ammo: 3000,
    spareparts_hyperion_reflect_shield: 100,
  };

  updateStatsCounters(counters);
}

function completePhospheneChallenges() {
  const counters = {
      base: {
        shiny_anarchy: 1,
        shiny_asher: 1,
        shiny_atlien: 1,
        shiny_ballista: 1,
        shiny_beegun: 1,
        shiny_bloodstarved: 1,
        shiny_bod: 1,
        shiny_bonnieclyde: 1,
        shiny_boomslang: 1,
        shiny_bugbear: 1,
        shiny_bully: 1,
        shiny_chuck: 1,
        shiny_coldshoulder: 1,
        shiny_commbd: 1,
        shiny_complex_root: 1,
        shiny_convergence: 1,
        shiny_crowdsourced: 1,
        shiny_dividedfocus: 1,
        shiny_dualdamage: 1,
        shiny_finnty: 1,
        shiny_fisheye: 1,
        shiny_gmr: 1,
        shiny_goalkeeper: 1,
        shiny_goldengod: 1,
        shiny_goremaster: 1,
        shiny_heartgun: 1,
        shiny_heavyturret: 1,
        shiny_hellfire: 1,
        shiny_hellwalker: 1,
        shiny_kaleidosplode: 1,
        shiny_kaoson: 1,
        shiny_katagawa: 1,
        shiny_kickballer: 1,
        shiny_kingsgambit: 1,
        shiny_leadballoon: 1,
        shiny_linebacker: 1,
        shiny_lucian: 1,
        shiny_lumberjack: 1,
        shiny_luty: 1,
        shiny_noisycricket: 1,
        shiny_ohmigot: 1,
        shiny_om: 1,
        shiny_onslaught: 1,
        shiny_phantom_flame: 1,
        shiny_plasmacoil: 1,
        shiny_potatothrower: 1,
        shiny_prince: 1,
        shiny_queensrest: 1,
        shiny_quickdraw: 1,
        shiny_rainbowvomit: 1,
        shiny_rangefinder: 1,
        shiny_roach: 1,
        shiny_rocketreload: 1,
        shiny_rowan: 1,
        shiny_rubysgrasp: 1,
        shiny_seventh_sense: 1,
        shiny_sideshow: 1,
        shiny_slugger: 1,
        shiny_star_helix: 1,
        shiny_stopgap: 1,
        shiny_stray: 1,
        shiny_sweet_embrace: 1,
        shiny_symmetry: 1,
        shiny_tkswave: 1,
        shiny_truck: 1,
        shiny_vamoose: 1,
        shiny_wf: 1,
        shiny_wombocombo: 1,
        shiny_zipgun: 1,
      },
  };

  updateStatsCounters(counters, 'shinygear');
}


/**
 * Sets all achievement counter values to completed.
 * Unknown how effective this is for actually unlocking achievements.
 * Activity completion achievement is not controlled by a counter.
 */
function completeAllAchievements() {
  const counters = {
    '00_level_10': 1,
    '01_level_30': 1,
    '02_level_50': 1,
    '03_uvh_5': 1,
    '04_cosmetics_collect': 60,
    '05_vehicles_collect': 10,
    '06_legendaries_equip': 1,
    '07_challenges_gear': 1,
    '08_challenges_manufacturer': 1,
    // complete all activities achievement doesnt seem to have a counter - it just checks completed activity missions
    '10_worldevents_colosseum': 1,
    '11_worldevents_airship': 1,
    '12_worldevents_meteor': 1,
    '13_contracts_complete': 80,
    '14_discovery_grasslands': 54,
    '15_discovery_mountains': 62,
    '16_discovery_shatteredlands': 47,
    '17_discovery_city': 21,
    '18_worldboss_defeat': 1,
    '19_vaultguardian_defeat': {
      '19_vaultguardian_grasslands': 1,
      '19_vaultguardian_mountains': 1,
      '19_vaultguardian_shatteredlands': 1,
    },
    '20_missions_survivalist': 3,
    '21_missions_auger': 7,
    '22_missions_electi': 3,
    '23_missions_claptrap': 5,
    '24_missions_side': 98,
    '25_missions_grasslands': 1,
    '26_missions_mountains': 1,
    '27_missions_shatteredlands': 1,
    '28_missions_elpis': 1,
    '29_missions_main': 1,
    '30_moxxi_hidden': 1,
    '31_tannis_hidden': 1,
    '32_zane_hidden': 1,
    '33_oddman_hidden': 1,
    '34_dave_hidden': 1,
  };

  updateStatsCounters(counters, 'achievements');
  if (typeof mergeMissionsetsOfType === 'function') mergeMissionsetsOfType('activity');
}

/**
 * Updates challenge counters in the save file.
 * Only updates counters if the new value is higher than the existing value.
 *
 * @param {Object<string, number>} counters - Object mapping counter names to their target values
 * @param {string} [category='challenge'] - The category of counters to update ('challenge' or 'achievements')
 */
function updateStatsCounters(counters, category = 'challenge') {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.stats = data.stats || {};
  data.stats[category] = data.stats[category] || {};

  for (const [key, value] of Object.entries(counters)) {
    const prev = data.stats.challenge[key];
    if (prev === undefined || value > prev) {
      data.stats[category][key] = value;
    }
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}
