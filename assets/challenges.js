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
  completeAllCollectibles();

  completeCowbellChallenges(); // story pack 1
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
    mission_uvh_6a: 1,
    uvh_1_finalchallenge: 1,
    uvh_2_finalchallenge: 1,
    uvh_3_finalchallenge: 1,
    uvh_4_finalchallenge: 1,
    uvh_5_finalchallenge: 1,
  };

  updateStatsCounters(counters);
  updateStatsCounters({'uvh_7': 1}, 'dlc_challenge');
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

function completeDLCChallenges() {
  const cello_openworld = {
    cello_collectibles: {
      dlc2_echologs: {
        dlc2_echolog_01: 1,
        dlc2_echolog_02: 1,
        dlc2_echolog_03: 1,
        dlc2_echolog_04: 1,
        dlc2_echolog_05: 1,
        dlc2_echolog_06: 1,
        dlc2_echolog_07: 1,
        dlc2_echolog_08: 1,
        dlc2_echolog_09: 1,
      },
    },
  };
  updateStatsCounters(cello_openworld, 'cello_openworld');

  const cowbell_challenges = {
    combat: {
      kraggon_secondwind: 30, // black arrow
      dahl_nightmare_split: 100, // make us wholew
    },
    enemies: {
      kill_scav_psychos: 1000, // beneath a maddened sky
      kill_scav_guntoters: 1000, // moon goons
      kill_scav_outlaws: 300, // i am the law
      kill_scav_splices: 300, // socket to ya
      kill_dahl_grunts: 1000, // duty beyond death
      kill_dahl_mechs: 300, // flesh and circuit made one
      kill_kraggons: 1000, // rocked to sleep
    },
    world_rift_boss: 10, // scourge of the other side
    spooky_story: {
      buyerremorse: 1,
      lallorona1: 1,
      lallorona2: 1,
      lallorona3: 1,
      lucineintro: 1,
      lucine1: 1,
      lucine2: 1,
      lucine3: 1,
      lucine4: 1,
      lucine5: 1,
      prettiersmile: 1,
      voodoo: 1,
    }, // the nighttime conglomerate
  };
  updateStatsCounters(cowbell_challenges, 'cowbell_challenges');

  const cowbell_openworld = {
    cowbell_activities:{
      speakeasyportals:{
        speakeasyportal_1: 1,
        speakeasyportal_2: 1,
        speakeasyportal_3: 1,
        speakeasyportal_4: 1,
        speakeasyportal_5: 1,
        speakeasyportal_6: 1,
      }, // i spy
      achievement_activities: {
        dahlbunkers: {
          dahlbunker_1: 1,
        },
        scavsiphons: {
          scavsiphon_1: 1,
          scavsiphon_2: 1,
        },
      },
    },
    cowbell_collectibles: {
      dahlcaches: {
        dahlcache_1: 1,
        dahlcache_2: 1,
        dahlcache_3: 1,
        dahlcache_4: 1,
        dahlcache_5: 1,
      }, // corporate recycling subsidies
      recordplayers:{
        recordplayer_1: 1,
        recordplayer_2: 1,
        recordplayer_3: 1,
        recordplayer_4: 1,
        recordplayer_5: 1,
      }, // tales from the counter
      dlc1_vaultsymbols:{
        dlc1_vaultsymbol_1: 1,
        dlc1_vaultsymbol_2: 1,
        dlc1_vaultsymbol_3: 1,
        dlc1_vaultsymbol_4: 1,
        dlc1_vaultsymbol_5: 1,
      }, // the profane sigils
      dlc1_echologs: {
        dlc1_echolog_1: 1,
        dlc1_echolog_2: 1,
        dlc1_echolog_3: 1,
        dlc1_echolog_4: 1,
        dlc1_echolog_5: 1,
        dlc1_echolog_6: 1,
        dlc1_echolog_7: 1,
        dlc1_echolog_8: 1,
        dlc1_echolog_9: 1,
        dlc1_echolog_10: 1,
        dlc1_echolog_11: 1,
        dlc1_echolog_12: 1,
        dlc1_echolog_13: 1,
        dlc1_echolog_14: 1,
        dlc1_echolog_15: 1,
        dlc1_echolog_16: 1,
        dlc1_echolog_17: 1,
        dlc1_echolog_18: 1,
        dlc1_echolog_19: 1,
        dlc1_echolog_20: 1,
        dlc1_echolog_21: 1,
        dlc1_echolog_26: 1,
        dlc1_echolog_27: 1,
        dlc1_echolog_28: 1,
        dlc1_echologs_fishing: {
          dlc1_echolog_22: 1,
          dlc1_echolog_23: 1,
          dlc1_echolog_24: 1,
          dlc1_echolog_25: 1,
        },
      }, // who knows whats listening
    },
    cowbell_misc: {
      clots: {
        clot_1: 1,
        clot_2: 1,
        clot_3: 1,
        clot_4: 1,
        clot_5: 1,
        clot_6: 1,
        clot_7: 1,
        clot_8: 1,
        clot_9: 1,
        clot_10: 1,
        clot_11: 1,
        clot_12: 1,
        clot_13: 1,
        clot_14: 1,
        clot_15: 1,
        clot_16: 1,
        clot_17: 1,
        clot_18: 1,
        clot_19: 1,
        clot_20: 1,
        clot_21: 1,
        clot_22: 1,
        clot_23: 1,
        clot_24: 1,
        clot_25: 1,
      },
      shuggurathtanks: {
        shuggurathtank_1: 1,
        shuggurathtank_2: 1,
        shuggurathtank_3: 1,
      },
      kickdowns: {
        wsw_bridge_parent:{
          wsw_bridge_left: 1,
          wsw_bridge_right: 1,
        },
      },
    },
  };
  updateStatsCounters(cowbell_openworld, 'cowbell_openworld');

  const harp_openworld = {
    harp_collectibles: {
      harp_echologs: {
        harp_echolog_1: 1,
        harp_echolog_2: 1,
        harp_echolog_3: 1,
        harp_echolog_4: 1,
        harp_echolog_5: 1,
      },
    },
  };
  updateStatsCounters(harp_openworld, 'harp_openworld');

  const tuba_openworld = {
    tuba_collectibles: {
      tuba_echologs: {
        tuba_echolog_1: 1,
        tuba_echolog_2: 1,
        tuba_echolog_3: 1,
        tuba_echolog_4: 1,
        tuba_echolog_5: 1,
        tuba_echolog_6: 1,
        tuba_echolog_7: 1,
      },
    },
  };
  updateStatsCounters(tuba_openworld, 'tuba_openworld');

  const harmonica_challenges = {
    dlc2_combat: {
      stop_frame_regeneration: 30,
      zipline_kill: 50,
    },
    dlc2_enemies: {
      kill_tediore_frames: 1000,
      kill_tediore_gliders: 1000,
      kill_tediore_infantry: 1000,
      kill_tediore_infantry_replacement: 300,
      kill_tediore_walker_mechs: 300,
    },
    dlc2_world: {
      managerhands: {
        hotel: 1,
        lava: 1,
        logistics: 1,
        spa: 1,
        theater: 1,
      },
      complete_rifts: 10,
      defeat_volcano_bosses: 5,
    },
    dlc2_characters: {
      corpohacker_levelup: 60,
      corpohacker_contagion_single: 1,
      corpohacker_contagion_tiered: 1000,
      corpohacker_manifestation_single: 1,
      corpohacker_manifestation_tiered: 1000,
      corpohacker_vpn_single: 1,
      corpohacker_vpn_tiered: 1000,
    },
  };
  updateStatsCounters(harmonica_challenges, 'harmonica_challenges');

  const harmonica_openworld = {
    dlc2_activities: {
      tikibar: {
        tikibar_1: 1,
        tikibar_2: 1,
        tikibar_3: 1,
      },
      tedioregrotto: {
        tedioregrotto_1: 1,
        tedioregrotto_2: 1,
      },
      tediorelockdown: {
        tediorelockdown_1: 1,
        tediorelockdown_2: 1,
      },
      treasurehunt: {
        treasurehunt_switch_parent: {
          treasurehunt_switch_01: 1,
          treasurehunt_switch_02: 1,
          treasurehunt_switch_03: 1,
          treasurehunt_switch_04: 1,
          treasurehunt_switch_05: 1,
        },
        treasurehunt_dooropened: 1,
        treasurehunt_bosskilled: 1,
      },
    },
    dlc2_collectibles: {
      tediore: {
        tediore_1: 1,
        tediore_2: 1,
        tediore_3: 1,
        tediore_4: 1,
        tediore_5: 1,
        tediore_6: 1,
        tediore_7: 1,
        tediore_8: 1,
        tediore_9: 1,
        tediore_10: 1,
      },
      islandsafes: {
        islandsafe_1: 1,
        islandsafe_2: 1,
        islandsafe_3: 1,
        islandsafe_4: 1,
        islandsafe_5: 1,
      },
      harmonica_echologs: {
        harmonica_echolog_1: 1,
        harmonica_echolog_2: 1,
        harmonica_echolog_3: 1,
        harmonica_echolog_4: 1,
        harmonica_echolog_5: 1,
        harmonica_echolog_6: 1,
        harmonica_echolog_7: 1,
        harmonica_echolog_8: 1,
        harmonica_echolog_9: 1,
        harmonica_echolog_10: 1,
        harmonica_echolog_11: 1,
        harmonica_echolog_12: 1,
        harmonica_echolog_13: 1,
        harmonica_echolog_14: 1,
        harmonica_echolog_15: 1,
        harmonica_echolog_16: 1,
        harmonica_echolog_17: 1,
        harmonica_echolog_18: 1,
        harmonica_echolog_19: 1,
        harmonica_echolog_20: 1,
        harmonica_echolog_21: 1,
        harmonica_echolog_22: 1,
        harmonica_echolog_23: 1,
        harmonica_echolog_24: 1,
        harmonica_echolog_25: 1,
        harmonica_echolog_26: 1,
        harmonica_echolog_27: 1,
        harmonica_echolog_28: 1,
        harmonica_echolog_29: 1,
        harmonica_echolog_30: 1,
        harmonica_echolog_31: 1,
        harmonica_echolog_32: 1,
        harmonica_echolog_33: 1,
        harmonica_echolog_34: 1,
        harmonica_echolog_35: 1,
        harmonica_echolog_36: 1,
        harmonica_echolog_37: 1,
        harmonica_echolog_38: 1,
        harmonica_echolog_39: 1,
        harmonica_echolog_40: 1,
        harmonica_echolog_41: 1,
        harmonica_echolog_42: 1,
      },
    },
    dlc2_misc: {
      ziplineshortcuts: {
        ziplineshortcut_1: 1,
        ziplineshortcut_2: 1,
        ziplineshortcut_3: 1,
        ziplineshortcut_4: 1,
        ziplineshortcut_5: 1,
        ziplineshortcut_6: 1,
        ziplineshortcut_7: 1,
      },
      dlc2_digigunk: {
        dlc2_digigunk_1: 1,
        dlc2_digigunk_2: 1,
        dlc2_digigunk_3: 1,
        dlc2_digigunk_4: 1,
        dlc2_digigunk_5: 1,
        dlc2_digigunk_6: 1,
      },
    },
  };
  updateStatsCounters(harmonica_openworld, 'harmonica_openworld');

  const viola_openworld = {
    viola_collectibles: {
      viola_echologs: {
        viola_echolog_1: 1,
        viola_echolog_2: 1,
        viola_echolog_3: 1,
        viola_echolog_4: 1,
      },
    },
  };
  updateStatsCounters(viola_openworld, 'viola_openworld');
}

/**
 * Sets all achievement counter values to completed.
 * Unknown how effective this is for actually unlocking achievements.
 * Activity completion achievement is not controlled by a counter.
 */
function completeAllAchievements() {
  const counters = {
    '00_level_10': 1, // crimson rising
    '01_level_30': 1, // good hunter
    '02_level_50': 1, // master of death and dance
    '03_uvh_5': 1, // gear five!
    '04_cosmetics_collect': 60, // the lookbook is the cookbook
    '05_vehicles_collect': 10, // catch a ride
    '06_legendaries_equip': 1, // i earned this
    '07_challenges_gear': 1, // area of expertise
    '08_challenges_manufacturer': 1, // brand equity
    // 09 - "rule of everything" - complete all activities (based on completed missions)
    '10_worldevents_colosseum': 1, // arena grande
    '11_worldevents_airship': 1, // reverse abduction
    '12_worldevents_meteor': 1, // shoot the moon
    '13_contracts_complete': 80, // freelance, but not for free
    '14_discovery_grasslands': 54, // unfaded
    '15_discovery_mountains': 62, // the mountain provides
    '16_discovery_shatteredlands': 47, // churn the burn
    '17_discovery_city': 21, // useful citizen
    '18_worldboss_defeat': 1, // pop out
    '19_vaultguardian_defeat': {
      '19_vaultguardian_grasslands': 1,
      '19_vaultguardian_mountains': 1,
      '19_vaultguardian_shatteredlands': 1,
    }, // nothing left to guard
    '20_missions_survivalist': 3, // pale blueberry dot
    '21_missions_auger': 7, // whos the boss
    '22_missions_electi': 3, // mole money, mole problems
    '23_missions_claptrap': 5, // widely beloved mascot
    '24_missions_side': 98, // grassroots campaigner
    '25_missions_grasslands': 1, // false idolator
    '26_missions_mountains': 1, // as if moved by an occult hand
    '27_missions_shatteredlands': 1, // long live the queen
    '28_missions_elpis': 1, // howling on the moon
    '29_missions_main': 1, // everything breaks
    '30_moxxi_hidden': 1, // glucode guardian
    '31_tannis_hidden': 1, // cut that out
    '32_zane_hidden': 1, // all things vend
    '33_oddman_hidden': 1, // rift incompatible
    '34_dave_hidden': 1, // guac is extra
  };

  updateStatsCounters(counters, 'achievements');
  completeDLCAchievements();
  if (typeof mergeMissionsetsWithPrefix === 'function')
    mergeMissionsetsWithPrefix('missionset_zoneactivity_');
}

/**
 * Sets location discovery achievement counter values to completed.
 */
function completeDiscoveryAchievements() {
  const counters = {
    '14_discovery_grasslands': 54,
    '15_discovery_mountains': 62,
    '16_discovery_shatteredlands': 47,
    '17_discovery_city': 21,
  };

  updateStatsCounters(counters, 'achievements');
}

function completeDLCAchievements() {
  // bounty pack 2 (stone demon) - codename cello
  const cello_achievements = {
    '35_cello_enemies_defeat': 50, // ordont you glad i didnt say eridium
    '36_cello_boss_defeat': {
      'pangolin': 1, // stone demon
      'phalanx': 1, // bore-tex
      'cat': 1, // chiselbella
      'splice': 1, // sturmdrang
    }, // fist of the mountain
    '37_cello_missions_main': 1, // the demons domain
  };
  updateStatsCounters(cello_achievements, 'cello_achievements');

  // story pack 1 (vault of the damned) - codename cowbell
  const cowbell_achievements = {
    // 38 - "dahl cleanup crew" - complete all activities (based on completed missions)
    '39_cowbell_side_missions': 11, // looking for work at the top of the world
    '40_cowbell_defeat_rift_boss': 1, // find me in the rift
    '41_cowbell_complete_mission_01_polarwastes': 1, // heartwarming
    '42_cowbell_complete_mission_02_findellie': 1, // sugar wrath
    '43_cowbell_complete_mission_03_bloodstainedhollows': 1, // legally unspecified tincture
    '44_cowbell_complete_mission_04_colonyship': 1, // hull froze over
    '45_cowbell_complete_mission_05_vaultstorm': 1, // he loved you
  };
  updateStatsCounters(cowbell_achievements, 'cowbell_achievements');

  // bounty pack 3 (a zane to kill for) - codename mandolin
  const mandolin_achievements = {
    '46_mandolin_coin_chest': 1, // pay to win
    '47_mandolin_boss_defeat': { // ai psychosis
      'cleaner': 1,
      'fixer': 1,
      'main': 1,
    },
    '48_mandolin_missions_main': 1, // bane of zane
  }
  updateStatsCounters(mandolin_achievements, 'mandolin_achievements');

  // bounty pack 4 (murders and acquisitions) - codename harp
  const harp_achievements = {
    '49_harp_responses_all': { // the full flock
      'skankeyes1': 1,
      'skankeyes2': 1,
      'dave1': 1,
      'dave2': 1,
      'william1': 1,
      'william2': 1,
    },
    '50_harp_boss_defeat': { // detoxed and ready to rock
      'infamousdave': 1,
      'maxxxsupreme': 1,
      'skankeyes': 1,
      'betamaxxx': 1,
    },
    '51_harp_missions_main': 1, // murdered + acquired
  }
  updateStatsCounters(harp_achievements, 'harp_achievements');

  // story pack 2 (fl4k and the last resort) - codename harmonica
  const harmonica_achievements = {
    'dlc2_activityachievement': 4, // vacation from my vacation
    // "tourism and duty" - complete all side missions
    'dlc2_riftboss': 1, // rift and tear
    // "substation satisfaction"
    // "does the skag die?"
    // "gimme a hand(s)"
    'dlc2_unlockvolcanofortress': 1, // harmony awaits
    // "wild at heart"
  }
  updateStatsCounters(harmonica_achievements, 'harmonica_achievements');

  // bounty pack 5 (amara and the vile shadows) - codename viola
  const viola_achievements = {
    '52_viola_discover_treasure': 1, // thief in the night
    '53_viola_boss_defeat': { // came back wrong
      testzero: 1,
      hybridthresher: 1,
      viledave: 1,
    },
    '54_viola_missions_main': 1, // reach exceeded
  }
  updateStatsCounters(viola_achievements, 'viola_achievements');
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
