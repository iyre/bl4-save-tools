/**
 * Zone activity management module.
 * Activities are tracked in two places:
 * - Character saves: zone activity missionsets (completing the activity itself)
 * - Profile saves: shared progress entries (counting toward shared Echo token progress)
 * Each activity type below lists its sources in both, so one preset can work on either save.
 */

/**
 * Activity types shown as separate presets.
 * - missionsets: character save missionset keys
 * - profile: [unlockables key, entry prefix] pairs in the profile save.
 *   Keys starting with "sharedprogress_" are DLC content; everything else is base game.
 */
const ACTIVITY_TYPES = [
  {
    key: 'crawler',
    label: 'Crawlers',
    missionsets: ['missionset_zoneactivity_crawler'],
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_crawlers']],
  },
  {
    key: 'drillsite',
    label: 'Drill Sites',
    missionsets: ['missionset_zoneactivity_drillsite'],
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_drillsites']],
  },
  {
    key: 'mine',
    label: 'Auger Mines',
    missionsets: ['missionset_zoneactivity_mine'],
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_augermines']],
  },
  {
    key: 'bunker',
    label: 'Bunkers',
    missionsets: ['missionset_zoneactivity_orderbunker', 'missionset_zoneactivity_dlc1_bunker'],
    profile: [
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_orderbunkers'],
      ['sharedprogress_cowbell', 'SharedProgress_Cowbell.zoneactivity_bunker'],
    ],
  },
  {
    key: 'safehouse',
    label: 'Safehouses',
    missionsets: ['missionset_zoneactivity_safehouse', 'missionset_harmonica_zoneactivity_safehouse'],
    profile: [
      ['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_safehouses'],
      ['sharedprogress_harmonica', 'SharedProgress_Harmonica.ZoneActivity_TikiBar'],
    ],
  },
  {
    key: 'silo',
    label: 'Silos',
    missionsets: ['missionset_zoneactivity_silo'],
    profile: [['echo_upgrade_challenges', 'echo_upgrade_challenges.activity_silos']],
  },
  {
    key: 'fuelsiphon',
    label: 'Fuel Siphons',
    missionsets: ['missionset_zoneactivity_dlc1_fuelsiphon'],
    profile: [['sharedprogress_cowbell', 'SharedProgress_Cowbell.zoneactivity_fuelsiphon']],
  },
  {
    key: 'grotto',
    label: 'Grottos',
    missionsets: ['missionset_harmonica_zoneactivity_grotto'],
    profile: [['sharedprogress_harmonica', 'SharedProgress_Harmonica.ZoneActivity_TedioreGrotto']],
  },
  {
    key: 'lockdown',
    label: 'Lockdowns',
    missionsets: ['missionset_harmonica_zoneactivity_lockdown'],
    profile: [['sharedprogress_harmonica', 'SharedProgress_Harmonica.ZoneActivity_TedioreLockdown']],
  },
];

function getActivityType(type) {
  return ACTIVITY_TYPES.find((t) => t.key === type);
}

/**
 * Returns true if the activity type ('all' or an ACTIVITY_TYPES key) has any content in scope
 * for the given save type.
 */
function activityHasContent(type, scope, profile) {
  if (type === 'all') return true;
  const t = getActivityType(type);
  return profile
    ? t.profile.some((source) => inScope(isBaseProfileSource(source), scope))
    : t.missionsets.some((key) => inScope(isBaseGameMissionset(key), scope));
}

function activityMissionsetMatches(key, type, scope) {
  if (type === 'all') return missionsetMatches(key, 'activity', scope);
  return getActivityType(type).missionsets.includes(key) && inScope(isBaseGameMissionset(key), scope);
}

function describeActivities(type, scope) {
  const noun = type === 'all' ? 'activities' : `${getActivityType(type).label.toLowerCase()} activities`;
  return [scope === 'all' ? 'all' : CONTENT_SCOPE_LABELS[scope], noun].join(' ');
}

/**
 * Completes activities of a type ('all' or an ACTIVITY_TYPES key) in scope ('base' | 'dlc' | 'all').
 * Character saves get the activity missionsets; profile saves get the shared progress entries.
 */
function completeActivities(type, scope) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  let count = 0;
  if (isProfileSave) {
    if (!hasProfileUnlockables(data)) return;
    for (const [key, prefix] of getSharedProgressSources('activity', scope, type)) {
      count += mergeUnlockableEntries(data, key, prefix);
    }
  } else {
    data.missions = data.missions || {};
    data.missions.local_sets = data.missions.local_sets || {};
    for (const key in MISSIONSETS) {
      if (activityMissionsetMatches(key, type, scope)) {
        data.missions.local_sets[key] = MISSIONSETS[key];
        count++;
      }
    }
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  if (isProfileSave) updateEchoPoints();

  const unit = isProfileSave ? 'new entries' : 'mission sets';
  return `Completed ${describeActivities(type, scope)} (${count} ${unit}).`;
}

/**
 * Resets activities of a type in scope to not started.
 */
function resetActivities(type, scope) {
  const data = getYamlDataFromEditor();
  if (!data) return;

  let count = 0;
  if (isProfileSave) {
    if (!hasProfileUnlockables(data)) return;
    for (const [key, prefix] of getSharedProgressSources('activity', scope, type)) {
      count += removeUnlockableEntries(data, key, prefix);
    }
  } else {
    const sets = data.missions?.local_sets || {};
    for (const key of Object.keys(sets)) {
      if (activityMissionsetMatches(key, type, scope)) {
        delete sets[key];
        count++;
      }
    }
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));

  const unit = isProfileSave ? 'entries' : 'mission sets';
  return `Reset ${describeActivities(type, scope)} (${count} ${unit}).`;
}

// Character save missionsets for the activities that gate fast travel points
const FAST_TRAVEL_MISSIONSETS = [
  'missionset_zoneactivity_silo',
  'missionset_zoneactivity_safehouse',
  'missionset_harmonica_zoneactivity_safehouse',
];

/**
 * Completes the safehouse and silo missionsets in a character save. Safehouse markers are only
 * discovered when shared progression is disabled, since the profile save holds them otherwise.
 */
function unlockCharacterFastTravel() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  data.missions = data.missions || {};
  data.missions.local_sets = data.missions.local_sets || {};
  for (const key of FAST_TRAVEL_MISSIONSETS) {
    data.missions.local_sets[key] = MISSIONSETS[key];
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));

  if (!isSharedProgressionEnabled()) discoverSafehouseLocations();
  return `Unlocked fast travel (${FAST_TRAVEL_MISSIONSETS.length} mission sets).`;
}

function removeCharacterFastTravel() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  const sets = data.missions?.local_sets || {};
  let count = 0;
  for (const key of FAST_TRAVEL_MISSIONSETS) {
    if (key in sets) {
      delete sets[key];
      count++;
    }
  }
  editor.setValue(jsyaml.dump(data, { lineWidth: -1, noRefs: true }));
  return `Removed fast travel (${count} mission sets).`;
}
