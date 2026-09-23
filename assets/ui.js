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

const CONTENT_SCOPES = [
  { key: 'base', label: 'Base Game' },
  { key: 'dlc', label: 'DLC' },
  { key: 'all', label: 'All' },
];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Preset cards shown in the presets panel. Only cards matching the loaded save type are shown.
 * Scoped cards show a Base Game / DLC / All switch and build their presets from the chosen scope.
 * Preset shape:
 * - title, desc: tile title and description
 * - apply: function that edits the YAML; may return a string used as the feedback message
 * - remove: optional { title, desc, apply } that undoes the preset in remove mode
 * - popup: true when apply opens a modal rather than editing directly
 * @type {Array<Object>}
 */
const PRESET_CARDS = [
  {
    id: 'character',
    title: 'Character',
    saveType: 'character',
    presets: [
      {
        title: `Max Level (${MAX_LEVEL})`,
        desc: `Sets character level to the maximum (${MAX_LEVEL}).`,
        apply: () => setCharacterToMaxLevel(),
      },
      {
        title: 'Change Class',
        desc: 'Changes character class (select from list).',
        apply: () => showChangeClassPopup(),
        popup: true,
      },
      {
        title: 'Complete Challenges',
        desc: "Completes all challenges (doesn't grant rewards).",
        apply: () => completeAllChallenges(),
      },
      {
        title: 'Complete Achievements',
        desc: 'Completes all achievements.',
        apply: () => completeAllAchievements(),
      },
      {
        title: 'Unlock All Specializations',
        desc: 'Unlocks the specialization system and all skills.',
        apply: () => unlockAllSpecialization(),
      },
      {
        title: 'Unlock UVHM / Postgame',
        desc: 'Sets flags to unlock UVH mode and post-game activities.',
        apply: () => unlockPostgame(),
      },
      {
        title: 'Set All Items to Character Level',
        desc: 'Updates serials for all backpack items to match current character level.',
        apply: () => updateAllSerialLevels(),
      },
      {
        title: 'Add Item Serials to Backpack',
        desc: 'Adds specified item serials to backpack.',
        apply: () => showAddItemsPopup(),
        popup: true,
      },
    ],
  },
  {
    id: 'missions',
    title: 'Missions',
    saveType: 'character',
    scoped: true,
    presets: (scope) =>
      [
        ['story', 'Story Missions'],
        ['side', 'Side Missions'],
        ['activity', 'Activity Missions'],
        ['all', 'All Missions'],
      ].map(([kind, noun]) => {
        const what = describeMissions(kind, scope);
        const extra =
          (kind === 'story' || kind === 'all') && scope !== 'dlc'
            ? ' Stages the epilogue so specializations unlock.'
            : '';
        return {
          title: `Complete ${noun}`,
          desc: `Completes ${what}.${extra}`,
          apply: () => completeMissions(kind, scope),
          remove: {
            title: `Remove ${noun}`,
            desc: `Resets ${what} to not started.`,
            apply: () => removeMissions(kind, scope),
          },
        };
      }),
  },
  {
    id: 'world',
    title: 'World',
    saveType: 'profile',
    presets: [
      {
        title: 'Remove Map Fog',
        desc: 'Removes fog of war from all maps.',
        apply: () => clearMapFog(),
        remove: {
          title: 'Re-add Map Fog',
          desc: 'Restores fog of war on all maps.',
          apply: () => addMapFog(),
        },
      },
      {
        title: 'Discover Locations',
        desc: 'Adds all location and collectible markers to the map.',
        apply: () => discoverAllLocations(),
        remove: {
          title: 'Un-discover Locations',
          desc: 'Removes all known location and collectible markers from the map.',
          apply: () => undiscoverAllLocations(),
        },
      },
      {
        title: 'Unlock Fast Travel',
        desc: 'Completes all safehouse and silo activities, unlocking them as fast travel destinations.',
        apply: () => unlockFastTravel(),
        remove: {
          title: 'Lock Fast Travel',
          desc: 'Un-completes all safehouse and silo activities on the profile.',
          apply: () => removeFastTravel(),
        },
      },
    ],
  },
  {
    id: 'progress',
    title: 'Collectibles & Activities',
    saveType: 'profile',
    scoped: true,
    presets: (scope) => {
      const collectibles = describeSharedProgress('collectible', scope);
      const activities = describeSharedProgress('activity', scope);
      return [
        {
          title: 'Unlock Collectibles',
          desc: `Marks ${collectibles} as found (echo logs, capsules, vault keys, etc.) for all characters.`,
          apply: () => completeSharedProgress('collectible', scope),
          remove: {
            title: 'Remove Collectibles',
            desc: `Marks ${collectibles} as not found.`,
            apply: () => removeSharedProgress('collectible', scope),
          },
        },
        {
          title: 'Complete Activities',
          desc: `Marks ${activities} complete on the profile, counting toward shared Echo token progress.`,
          apply: () => completeSharedProgress('activity', scope),
          remove: {
            title: 'Remove Activities',
            desc: `Marks ${activities} as not completed on the profile.`,
            apply: () => removeSharedProgress('activity', scope),
          },
        },
      ];
    },
  },
  {
    id: 'unlocks',
    title: 'Unlocks & Items',
    saveType: 'profile',
    presets: [
      {
        title: 'Max SDU',
        desc: 'Purchases all SDU upgrades, granting additional Echo tokens if needed.',
        apply: () => setMaxSDU(),
      },
      {
        title: 'Unlock Vault Powers',
        desc: 'Unlocks all powerups from completing vaults.',
        apply: () => completeSharedVaultUnlocks(),
      },
      {
        title: 'Unlock New Game Shortcuts',
        desc: 'Unlocks all new game shortcuts (skip prologue, skip story, specialization system).',
        apply: () => unlockNewGameShortcuts(),
      },
      {
        title: 'Unlock Hover Drives',
        desc: 'Unlocks all hover drive manufacturers and tiers.',
        apply: () => unlockAllHoverDrives(),
      },
      {
        title: 'Unlock Cosmetics',
        desc: 'Unlocks (almost) all cosmetic items.',
        apply: () => unlockAllCosmetics(),
      },
      {
        title: `Set All Bank Items to Max Level (${MAX_LEVEL})`,
        desc: `Updates serials for all bank items to have max level (${MAX_LEVEL}).`,
        apply: () => updateAllSerialLevels(),
      },
      {
        title: 'Add Item Serials to Bank',
        desc: 'Adds specified item serials to bank.',
        apply: () => showAddItemsPopup(),
        popup: true,
      },
    ],
  },
];

let presetMode = 'apply';
let saveLoaded = false;
// preset id -> 'applied' | 'removed', reset on import
const presetStatus = new Map();
// card id -> selected content scope for scoped cards
const cardScopes = {};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Renders preset cards for the loaded save type (all cards before a save is loaded).
 */
function renderPresets() {
  const container = document.getElementById('preset-cards');
  container.innerHTML = '';
  const activeSaveType = isProfileSave ? 'profile' : 'character';

  for (const card of PRESET_CARDS) {
    if (saveLoaded && card.saveType !== activeSaveType) continue;

    const cardEl = createElement('div', 'preset-card');
    const header = createElement('div', 'preset-group-header');
    header.appendChild(createElement('span', 'preset-card-title', card.title));
    if (!saveLoaded) {
      header.appendChild(createElement('span', 'preset-card-tag', `${card.saveType} save`));
    }
    const scope = card.scoped ? cardScopes[card.id] || 'all' : null;
    if (card.scoped) header.appendChild(createScopeToggle(card.id, scope));
    cardEl.appendChild(header);

    const presets = card.scoped ? card.presets(scope) : card.presets;
    const grid = createElement('div', 'preset-grid');
    presets.forEach((preset, i) => {
      const id = card.scoped ? `${card.id}:${i}:${scope}` : `${card.id}:${i}`;
      grid.appendChild(createPresetButton(preset, id));
    });
    cardEl.appendChild(grid);

    container.appendChild(cardEl);
  }
}

function createScopeToggle(cardId, selected) {
  const toggle = createElement('div', 'scope-toggle');
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Content');
  for (const { key, label } of CONTENT_SCOPES) {
    const btn = createElement('button', 'scope-btn', label);
    btn.classList.toggle('active', key === selected);
    btn.setAttribute('aria-pressed', String(key === selected));
    btn.onclick = () => {
      cardScopes[cardId] = key;
      renderPresets();
    };
    toggle.appendChild(btn);
  }
  return toggle;
}

/**
 * Creates a tile button (title + description) for a preset in the current mode.
 */
function createPresetButton(preset, id) {
  const removing = presetMode === 'remove';
  const action = removing ? preset.remove : preset;

  const btn = createElement('button', 'secondary preset-btn');
  btn.appendChild(createElement('span', 'preset-title', action ? action.title : preset.title));
  btn.appendChild(
    createElement('span', 'preset-desc', action ? action.desc : "Can't be undone.")
  );

  const status = presetStatus.get(id);
  if (status) btn.classList.add(status === 'applied' ? 'preset-applied' : 'preset-removed');

  if (!action) {
    btn.disabled = true;
    return btn;
  }

  btn.onclick = () => runPreset(id, action, removing);
  return btn;
}

function runPreset(id, action, removing) {
  if (action.popup) {
    action.apply();
    return;
  }

  const before = editor.getValue();
  let result;
  try {
    result = action.apply();
  } catch (e) {
    console.error(e);
    showToast(`${capitalize(action.title)} failed: ${e.message}`, 'error');
    return;
  }

  const changed = editor.getValue() !== before;
  const message = typeof result === 'string' ? result : `${capitalize(action.title)} done.`;
  if (!changed) {
    showToast(`${message} No changes were needed.`, 'info');
    return;
  }
  showToast(message, removing ? 'remove' : 'apply');
  presetStatus.set(id, removing ? 'removed' : 'applied');
  renderPresets();
}

function setPresetMode(mode) {
  presetMode = mode;
  const removing = mode === 'remove';
  document.body.classList.toggle('remove-mode', removing);
  document.getElementById('preset-heading').textContent = removing ? 'Remove Presets' : 'Apply Presets';
  document.getElementById('remove-mode-banner').hidden = !removing;
  for (const [btnId, btnMode] of [
    ['modeApplyBtn', 'apply'],
    ['modeRemoveBtn', 'remove'],
  ]) {
    const btn = document.getElementById(btnId);
    btn.classList.toggle('active', btnMode === mode);
    btn.setAttribute('aria-pressed', String(btnMode === mode));
  }
  renderPresets();
}

const EDITOR_COLLAPSED_KEY = 'bl4_editor_collapsed';

function setEditorCollapsed(collapsed) {
  document.body.classList.toggle('editor-open', !collapsed);
  const btn = document.getElementById('editorToggleBtn');
  btn.textContent = collapsed ? 'Show YAML' : 'Hide YAML';
  btn.setAttribute('aria-pressed', String(!collapsed));
  localStorage.setItem(EDITOR_COLLAPSED_KEY, collapsed ? '1' : '0');
}

function toggleEditor() {
  setEditorCollapsed(document.body.classList.contains('editor-open'));
}

/**
 * Shows a short-lived notification. kind: 'apply' | 'remove' | 'info' | 'error'
 */
function showToast(message, kind = 'info') {
  const area = document.getElementById('toast-area');
  const toast = createElement('div', `toast toast-${kind}`, message);
  area.appendChild(toast);
  while (area.children.length > 4) area.firstChild.remove();
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
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
  document.getElementById('exportSavBtn').disabled = false;
  document.getElementById('exportYamlBtn').disabled = false;
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
  saveLoaded = true;
  presetStatus.clear();
  document.getElementById('loaded-save-info').textContent =
    `Loaded ${file.name} (${isProfileSave ? 'profile' : 'character'} save)`;
  setPresetMode('apply');
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

  setEditorCollapsed(localStorage.getItem(EDITOR_COLLAPSED_KEY) !== '0');
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
      showToast(`Added ${serials.length} item serial${serials.length === 1 ? '' : 's'}.`, 'apply');
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
    showToast(`Changed class to ${CHARACTER_CLASSES[key].class} (${CHARACTER_CLASSES[key].name}).`, 'apply');
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
