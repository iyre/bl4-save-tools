/**
 * User Interface management module.
 * Provides functionality for:
 * - Preset button management and rendering
 * - Monaco editor setup and configuration
 * - File  if (groupName === 'Character') {mport/export handling
 * - YAML processing and normalization
 * - Save type detection (profile vs character)
 * - Character class selection UI
 */

let UPDATE_BANNER_ID = 'update-warning-v2';
if (localStorage.getItem('dismissed-banner') === UPDATE_BANNER_ID) {
  document.getElementById('update-banner').style.display = 'none';
} else {
  document.getElementById('update-banner').style.display = 'flex'; // comment this line when there are no outstanding issues
}
function toggleUpdateBanner() {
  const banner = document.getElementById('update-banner');
  if (banner.style.display === 'none') {
    banner.style.display = 'flex';
    localStorage.removeItem('dismissed-banner');
  } else {
    document.getElementById('update-banner').style.display = 'none';
    localStorage.setItem('dismissed-banner', UPDATE_BANNER_ID);
  }
}

// Defines maximum character level globally. Used in other files.
let MAX_LEVEL = 70;

/**
 * Defines available preset modifications for save files.
 * Each preset contains:
 * - handler: Function name to execute
 * - title: Display name in UI
 * - desc: Detailed description of the modification
 * - saveType: Whether it applies to 'character' or 'profile' saves
 * - group: UI grouping category
 * @type {Array<Object>}
 */
const PRESETS = [
  // character
  {
    handler: 'setCharacterToMaxLevel',
    title: `Max Level (${MAX_LEVEL})`,
    desc: `Sets character level to the maximum (${MAX_LEVEL}).`,
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'showChangeClassPopup',
    title: `Change Class`,
    desc: `Changes character class (select from list).`,
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'completeAllChallenges',
    title: 'Complete Challenges',
    desc: "Completes all challenges (doesn't grant rewards).",
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'completeAllAchievements',
    title: 'Complete Achievements',
    desc: 'Completes all achievements.',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'unlockAllSpecialization',
    title: 'Unlock All Specializations',
    desc: 'Unlocks the specialization system and all skills.',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'unlockPostgame',
    title: 'Unlock UVHM / Postgame',
    desc: 'Sets flags to unlock UVH mode and post-game activities.',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'completeAllStoryMissions',
    title: 'Complete Story Missions',
    desc: 'Completes all main story missions.',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'completeAllMissions',
    title: 'Complete All Missions',
    desc: 'Completes all main and side missions (including activities).',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'updateAllSerialLevels',
    title: 'Set All Items to Character Level',
    desc: 'Updates serials for all backpack items to match current character level.',
    saveType: 'character',
    group: 'Character',
  },
  {
    handler: 'showAddItemsPopup',
    title: 'Add Item Serials to Backpack',
    desc: 'Adds specified item serials to backpack.',
    saveType: 'character',
    group: 'Character',
  },

  // shared
  {
    handler: 'clearMapFog',
    title: 'Remove Map Fog',
    desc: 'Removes fog of war from all maps.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'discoverAllLocations',
    title: 'Discover Locations',
    desc: 'Adds all location and collectible markers to the map.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'unlockFastTravel',
    title: 'Unlock Fast Travel',
    desc: 'Completes all safehouse and silo activities, unlocking them as fast travel destinations.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'completeAllActivities',
    title: 'Complete All Activities',
    desc: 'Completes all activities.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'completeSharedCollectibles',
    title: 'Unlock Collectibles',
    desc: 'Unlocks all collectibles such as echo logs, propaganda towers, and vault keys, activities shared across characters.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'setMaxSDU',
    title: 'Max SDU',
    desc: 'Purchases all SDU upgrades, granting additional Echo tokens if needed.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'completeSharedVaultUnlocks',
    title: 'Unlock Vault Powers',
    desc: 'Unlocks all powerups from completing vaults.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'unlockNewGameShortcuts',
    title: 'Unlock New Game Shortcuts',
    desc: 'Unlocks all new game shortcuts (skip prologue, skip story, specialization system).',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'unlockAllHoverDrives',
    title: 'Unlock Hover Drives',
    desc: 'Unlocks all hover drive manufacturers and tiers.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'unlockAllCosmetics',
    title: 'Unlock Cosmetics',
    desc: 'Unlocks (almost) all cosmetic items.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'updateAllSerialLevels',
    title: `Set All Bank Items to Max Level (${MAX_LEVEL})`,
    desc: `Updates serials for all bank items to have max level (${MAX_LEVEL}).`,
    saveType: 'profile',
    group: 'Profile (shared)',
  },
  {
    handler: 'showAddItemsPopup',
    title: 'Add Item Serials to Bank',
    desc: 'Adds specified item serials to bank.',
    saveType: 'profile',
    group: 'Profile (shared)',
  },
];

/**
 * Renders all preset buttons in the UI, organized by category.
 * - Groups presets by their defined categories
 * - Handles character class change buttons separately
 * - Applies proper button states based on save type
 * - Sets up click handlers for each preset
 */
function renderPresets() {
  const presetSection = document.getElementById('preset-buttons');
  presetSection.innerHTML = '';

  // Build list of groups present, but enforce preferred ordering so Misc is last
  const presentGroups = new Set();
  PRESETS.forEach((p) => presentGroups.add(p.group));

  Array.from(presentGroups).forEach((groupName) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'preset-category';

    const header = document.createElement('div');
    header.className = 'preset-group-header';
    header.textContent = groupName;
    groupDiv.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'preset-grid';

    PRESETS.filter((p) => (p.group || 'Misc') === groupName).forEach((preset) => {
      const row = document.createElement('div');
      row.className = 'preset-row';

      const btn = document.createElement('button');
      btn.className = 'secondary';
      btn.style.position = 'relative';

      // Compute display metadata without mutating PRESETS
      const display = {
        title: preset.title,
        desc: preset.desc,
        saveType: preset.saveType,
      };
      btn.textContent = display.title;

      // Determine disabled state based on computed saveType (no mutation)
      if (
        (isProfileSave && display.saveType === 'character') ||
        (!isProfileSave && display.saveType === 'profile')
      ) {
        btn.disabled = true;
        btn.title = isProfileSave
          ? 'This preset only applies to character saves.'
          : 'This preset only applies to profile saves.';
      } else {
        btn.title = display.desc;
        btn.onclick = function () {
          // call handler by name if present
          if (typeof window[preset.handler] === 'function') {
            window[preset.handler]();
            btn.classList.add('preset-applied');
          } else {
            console.warn(`Handler not found: ${preset.handler}`);
          }
        };
      }

      row.appendChild(btn);
      grid.appendChild(row);
    });

    groupDiv.appendChild(grid);
    presetSection.appendChild(groupDiv);
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

/**
 * Imports and processes a save or YAML file.
 * Handles both encrypted .sav files and plain YAML files.
 * - Stores filename for later export
 * - Decrypts .sav files if necessary
 * - Normalizes YAML content
 * - Updates editor with processed content
 * @async
 */
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
    console.info('Loading YAML file directly into editor');
    yamlText = normalizeYaml(arrayBuffer);
  } else {
    yamlText = decryptSav(arrayBuffer);
  }
  editor.setValue(yamlText);
  clearPresetApplied();
  enableSections();
}

function normalizeYaml(yamlBytes) {
  if (yamlBytes instanceof ArrayBuffer) {
    yamlBytes = new Uint8Array(yamlBytes);
  }
  let yamlText = new TextDecoder().decode(yamlBytes);
  console.debug('YAML preview:', yamlText.slice(0, 100));
  console.debug('YAML length:', yamlBytes.length);

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
  const exportFilename = `${importFilename}_${timestamp.slice(0, 8)}_${timestamp.slice(8)}.yaml`;
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
document.getElementById('fileInput').addEventListener('change', async function () {
  if (editor) editor.setValue('');
  const userId = document.getElementById('userIdInput')?.value;
  if (userId) {
    try {
      await importFile();
    } catch (e) {
      console.error('opportunistic import failed:', e);
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

function clearPresetApplied() {
  document.querySelectorAll('.preset-applied').forEach((btn) => {
    btn.classList.remove('preset-applied');
  });
}

/**
 * Show a modal popup with the editor usage guide.
 * Closes when clicking the backdrop or pressing Escape.
 */
function showUsageModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal modal-usage';
  modal.style.width = '620px';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:0.3rem;';

  const header = document.createElement('div');
  header.className = 'preset-group-header';
  header.style.cssText = 'margin-bottom:0;border-bottom:none;padding-bottom:0;';
  header.textContent = 'How to Use';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'update-banner-minimize';
  closeBtn.style.color = '#aaa';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.onclick = close;

  headerRow.appendChild(header);
  headerRow.appendChild(closeBtn);
  modal.appendChild(headerRow);

  const body = document.createElement('div');
  body.className = 'modal-scrollable';
  body.innerHTML = `
    <ol>
      <li>Select a <code>.sav</code> file (or <code>.yaml</code> if you have one from a previous export).</li>
      <li>Enter your user ID for the <strong>PC</strong> platform you play the game on. (Needed to decrypt saves)
        <ul>
          <li>Steam ID is 17 digits. Find it at <a href="https://store.steampowered.com/account/" target="_blank" rel="noopener">store.steampowered.com/account</a>, or in the save file path.</li>
          <li>Epic ID is 32 characters. Find it at <a href="https://www.epicgames.com/account/personal/" target="_blank" rel="noopener">epicgames.com/account/personal</a>.</li>
        </ul>
      </li>
      <li>Click <strong>Import</strong> - this decrypts the save and loads the YAML data into the editor.</li>
      <li><strong>Export your original save as a backup</strong> before making any changes. Keep these timestamped files in case something goes wrong.</li>
      <li>Edit the save as desired:
        <ul>
          <li>Use the <strong>Apply Presets</strong> panel for common one-click changes.</li>
          <li>Edit the YAML directly in the editor for advanced modifications.</li>
        </ul>
      </li>
      <li>Click <strong>Export .sav</strong> to download the modified save.</li>
      <li>Rename or delete your original save and replace it with the new file (remove the timestamp from the filename).</li>
    </ol>
    <div class="modal-section-title">Save File Location (Windows)</div>
    <p class="modal-desc"><code>%USERPROFILE%\\Documents\\My Games\\Borderlands 4\\Saved\\SaveGames\\&lt;your_id&gt;\\Profiles\\client\\</code></p>
    <ul>
      <li><code>1.sav</code>, <code>2.sav</code>, etc. - character saves</li>
      <li><code>profile.sav</code> - shared state (settings, bank, cosmetics, map fog, etc.)</li>
    </ul>
    <div class="modal-section-title">Notes</div>
    <ul>
      <li>Consider disabling cloud saves for the game to prevent files from being reverted.</li>
      <li><u>Profile</u> saves can only be replaced while the game is closed, otherwise changes will be lost.</li>
      <li><u>Character</u> saves can be replaced while running as long as a <em>different</em> character is loaded.</li>
    </ul>
  `;
  modal.appendChild(body);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on backdrop click (but not on modal content click)
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKey);
}

/**
 * Show a modal popup to insert item serials.
 */
function showAddItemsPopup() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'preset-group-header';
  header.textContent = 'Add Item Serials';
  modal.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'modal-desc';
  desc.textContent = 'Enter the item serials you wish to add - one per line.';
  modal.appendChild(desc);

  const textarea = document.createElement('textarea');
  textarea.value = '';
  textarea.className = 'modal-textarea';
  modal.appendChild(textarea);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-btn-row';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = close;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.onclick = function () {
    const raw = textarea.value || '';
    const serials = raw
      .split(/[\r\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (typeof insertSerials === 'function') insertSerials(serials);
    } finally {
      close();
    }
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKey);
}

const CHARACTER_CLASSES = {
  DarkSiren: {
    name: 'Vex',
    class: 'Siren',
  },
  Paladin: {
    name: 'Amon',
    class: 'Forgeknight',
  },
  Gravitar: {
    name: 'Harlowe',
    class: 'Gravitar',
  },
  ExoSoldier: {
    name: 'Rafa',
    class: 'Exo-Soldier',
  },
  RoboDealer: {
    name: 'C4SH',
    class: 'Rogue (Paid DLC)',
  },
  CorpoHacker: {
    name: 'Loveless',
    class: 'Hacker (Paid DLC)',
  },
};

/**
 * Show a modal popup to choose a character class from the set defined in CHARACTER_CLASSES.
 * Calls setCharacterClass(key, name) on confirm. Cancel closes the modal.
 */
function showChangeClassPopup() {
  if (isProfileSave) {
    alert('This action only applies to character saves.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'preset-group-header';
  header.textContent = 'Change Character Class';
  modal.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'modal-desc';
  desc.textContent = 'Select the class you want to change to:';
  modal.appendChild(desc);

  const select = document.createElement('select');
  select.className = 'modal-select';
  select.style.width = '100%';
  select.style.marginBottom = '12px';

  // Populate options from CHARACTER_CLASSES
  for (const [key, info] of Object.entries(CHARACTER_CLASSES)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${info.class} (${info.name})`;
    select.appendChild(opt);
  }
  modal.appendChild(select);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-btn-row';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = close;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.onclick = function () {
    const key = select.value;
    if (!key || !CHARACTER_CLASSES[key]) {
      alert('No class selected.');
      return;
    }
    setCharacterClass(key, CHARACTER_CLASSES[key].name);
    close();
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKey);

  // focus select for quick keyboard use
  select.focus();
}
