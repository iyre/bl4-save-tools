// Functions for handling UI setup and interaction

const PRESETS = [
  {
    handler: 'clearMapFog',
    title: 'Remove Map Fog',
    desc: 'Removes fog of war from all maps.',
    saveType: 'character',
  },
  {
    handler: 'discoverAllLocations',
    title: 'Discover All Locations',
    desc: 'Adds all location and collectible markers to the map.',
    saveType: 'character',
  },
  {
    handler: 'completeAllSafehouseMissions',
    title: 'Unlock All Safehouses',
    desc: 'Completes all safehouse and silo activities, unlocking them as fast travel destinations.',
    saveType: 'character',
  },
  {
    handler: 'completeAllCollectibles',
    title: 'Unlock All Collectibles',
    desc: 'Completes all collectibles such as echo logs, propaganda towers, and vault keys.',
    saveType: 'character',
  },
  {
    handler: 'unlockVaultPowers',
    title: 'Unlock All Vault Powers',
    desc: 'Unlocks all powerups from completing vaults.',
    saveType: 'character',
  },
  {
    handler: 'unlockAllHoverDrives',
    title: 'Unlock All Hover Drives',
    desc: 'Unlocks all hover drive manufacturers and tiers.',
    saveType: 'character',
  },
  {
    handler: 'unlockAllSpecialization',
    title: 'Unlock All Specializations',
    desc: 'Unlocks the specialization system and all skills.',
    saveType: 'character',
  },
  {
    handler: 'completeAllStoryMissions',
    title: 'Skip Story Missions',
    desc: 'Completes all main story missions.',
    saveType: 'character',
  },
  {
    handler: 'completeAllMissions',
    title: 'Skip All Missions',
    desc: 'Completes all main and side missions.',
    saveType: 'character',
  },
  {
    handler: 'unlockUVHMode',
    title: 'Unlock UVHM',
    desc: 'Sets flags to unlock UVH mode.',
    saveType: 'character',
  },
  {
    handler: 'completeAllChallenges',
    title: 'Complete All Challenges',
    desc: 'Completes all challenges.',
    saveType: 'character',
  },
  {
    handler: 'unlockNewGameShortcuts',
    title: 'Unlock New Game Shortcuts',
    desc: 'Unlocks all new game shortcuts (skip prologue, skip story, specialization system).',
    saveType: 'profile',
  },
  {
    handler: 'unlockAllCosmetics',
    title: 'Unlock All Cosmetics',
    desc: 'Unlocks all cosmetic items.',
    saveType: 'profile',
  },
];

function renderPresets() {
  const presetSection = document.getElementById('preset-buttons');
  presetSection.innerHTML = '';

  PRESETS.forEach((preset) => {
    const row = document.createElement('div');
    row.className = 'preset-row';

    const btn = document.createElement('button');
    btn.className = 'secondary';
    btn.textContent = preset.title;

    // Disable button if save type doesn't match
    if (
      (isProfileSave && preset.saveType === 'character') ||
      (!isProfileSave && preset.saveType === 'profile')
    ) {
      btn.disabled = true;
      btn.title = isProfileSave
        ? 'This preset only applies to character saves.'
        : 'This preset only applies to profile saves.';
    } else {
      btn.onclick = function () {
        window[preset.handler]();
      };
    }

    const tooltip = document.createElement('span');
    tooltip.className = 'preset-tooltip';
    tooltip.textContent = '?';

    const tooltipText = document.createElement('span');
    tooltipText.className = 'tooltiptext';
    tooltipText.textContent = preset.desc;

    tooltip.appendChild(tooltipText);
    row.appendChild(btn);
    row.appendChild(tooltip);

    presetSection.appendChild(row);
  });
}

// Initialize Monaco Editor
require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
});
let editor;
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '', // initial YAML text
    language: 'yaml',
    theme: 'vs-dark',
    automaticLayout: true,
    tabSize: 2,
    stickyScroll: { enabled: true },
  });
});

let importFilename = 'imported';

function enableSections() {
  document.getElementById('presetSectionOverlay').style.display = 'none';
  document.getElementById('editorSectionOverlay').style.display = 'none';
}

async function importFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) {
    alert('Please select a file to upload.');
    return;
  }
  const arrayBuffer = await file.arrayBuffer();

  importFilename = file.name.split('.').slice(0, -1).join('.') || file.name;

  // Exit early if YAML file provided (already decrypted)
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext == 'yaml' || ext == 'yml') {
    console.log('Loading YAML file directly into editor');
    yamlText = normalizeYaml(arrayBuffer);
  } else {
    yamlText = decryptSav(arrayBuffer);
  }
  editor.setValue(yamlText);
  enableSections();
}

function normalizeYaml(yamlBytes) {
  if (yamlBytes instanceof ArrayBuffer) {
    yamlBytes = new Uint8Array(yamlBytes);
  }
  let yamlText = new TextDecoder().decode(yamlBytes);
  console.log('YAML preview:', yamlText.slice(0, 100));
  console.log('YAML length:', yamlBytes.length);

  // Remove !tags which jsyaml can't handle. These don't seem to be needed.
  yamlText = yamlText.replace(/:\s*!tags/g, ':');
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert('Failed to parse YAML after tag removal: ' + e);
    return;
  }

  try {
    const yamlData = jsyaml.load(yamlText);
    checkIfProfileSave(yamlData);
  } catch (e) {
    isProfileSave = false;
  }

  // Dump back to YAML to normalize indentation and formatting
  let normalizedYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  return normalizedYaml;
}

function downloadYaml() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); // e.g. 20250924153012
  const exportFilename = `${importFilename}_${timestamp.slice(
    0,
    8
  )}_${timestamp.slice(8)}.yaml`;
  const yamlText = editor.getValue();
  const blob = new Blob([yamlText], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFilename;
  a.click();
  URL.revokeObjectURL(url);
}

function getYamlDataFromEditor() {
  const yamlText = editor.getValue();
  try {
    return jsyaml.load(yamlText);
  } catch (e) {
    alert('Failed to parse YAML: ' + e);
    return;
  }
}

let presetNotificationTimeout = null;

function showPresetNotification(msg, duration = 2000) {
  const el = document.getElementById('presetNotification');
  if (!el) return;
  el.textContent = 'Done';
  el.style.display = 'block';
  el.classList.add('show');

  // Trigger flash animation
  el.classList.remove('flash'); // Remove if already present to restart animation
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add('flash');

  // Clear any previous timeout
  if (presetNotificationTimeout) {
    clearTimeout(presetNotificationTimeout);
  }

  presetNotificationTimeout = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.style.display = 'none';
    }, 300);
    presetNotificationTimeout = null;
  }, duration);
}

window.addEventListener('DOMContentLoaded', function () {
  // Restore user ID from localStorage on page load
  const previousUserId = localStorage.getItem('bl4_previous_userid');
  if (previousUserId) {
    document.getElementById('userIdInput').value = previousUserId;
  }

  // Render preset buttons
  renderPresets();
});

// Clear editor when selecting a new file, and try to import if userIdInput is set
document
  .getElementById('fileInput')
  .addEventListener('change', async function () {
    if (editor) editor.setValue('');
    const userId = document.getElementById('userIdInput')?.value;
    if (userId) {
      try {
        await importFile();
      } catch (e) {
        console.log('opportunistic import failed:', e);
      }
    }
  });

let isProfileSave = false;

function checkIfProfileSave(yamlData) {
  isProfileSave = !!(
    yamlData &&
    yamlData.domains &&
    yamlData.domains.local &&
    yamlData.domains.local.shared
  );
  renderPresets();
}
