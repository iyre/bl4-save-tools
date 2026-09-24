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
 * Preset cards shown in the presets panel. Only cards matching the loaded save type (or 'any') are shown.
 * Scoped cards show a Base Game / DLC / All switch and build their presets from the chosen scope.
 * Preset shape:
 * - title: tile title
 * - desc: hover text; worded to fit both modes and every scope
 * - apply: function that edits the YAML; may return a string used as the feedback message
 * - reset: optional { title, apply } that undoes the preset in reset mode
 * - popup: true when apply opens a modal rather than editing directly
 * - unavailable: true when the selected scope has no content for it, or a string giving another
 *   reason (shown disabled, reason as hover text). Use a getter when it depends on the save's contents
 * - key: scoped cards only; identifies the preset across scopes. 'all' covers every other key
 *   in the card, so it's shown full width and marks the presets it includes when run
 * - granular: true for per-type presets, only shown when the card's "By type" toggle is on
 * - id: unscoped cards only; stable id (`${card.id}:${id}`) instead of the preset's index
 * - marks: unscoped cards only; ids of other presets also marked applied when this one is applied
 * Cards with typed: true show the "By type" toggle.
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
        desc: `Character level ${MAX_LEVEL}.`,
        apply: () => setCharacterToMaxLevel(),
      },
      {
        title: 'Change Class',
        desc: 'Pick a new class from a list.',
        apply: () => showChangeClassPopup(),
        popup: true,
      },
      {
        title: 'Complete Challenges',
        desc: "All challenges. Rewards aren't granted.",
        apply: () => completeAllChallenges(),
      },
      {
        title: 'Complete Achievements',
        desc: 'All achievements.',
        apply: () => completeAllAchievements(),
      },
      {
        title: 'Max Specializations',
        desc: 'Unlock the specialization system and max all skills.',
        apply: () => unlockAllSpecialization(),
      },
      {
        title: 'Unlock UVHM / Postgame',
        desc: 'UVH mode and post-game activity flags.',
        apply: () => unlockPostgame(),
      },
      {
        id: 'vault-powers',
        title: 'Unlock Vault Powers',
        desc: 'Powerups from completing vaults. Vault doors are separate.',
        apply: () => unlockVaultPowers(),
        reset: {
          title: 'Reset Vault Powers',
          apply: () => resetVaultPowers(),
        },
      },
      {
        title: 'Items to Character Level',
        desc: 'Sets every backpack item serial to the current character level.',
        apply: () => updateAllSerialLevels(),
      },
      {
        title: 'Add Items to Backpack',
        desc: 'Paste item serials to add.',
        apply: () => showAddItemsPopup(),
        popup: true,
      },
      {
        title: 'Disable Shared Progression',
        desc: 'Map fog and discovered locations are stored per character instead of in the profile save. Re-enabling removes the per-character data.',
        apply: () => setSharedProgression(false),
        reset: {
          title: 'Enable Shared Progression',
          apply: () => setSharedProgression(true),
        },
      },
    ],
  },
  {
    id: 'character-world',
    title: 'World',
    saveType: 'character',
    presets: [
      {
        title: 'Remove Map Fog',
        desc: 'Fog of war on every map.',
        get unavailable() {
          return sharedProgressionUnavailable();
        },
        apply: () => clearMapFog(),
        reset: {
          title: 'Restore Map Fog',
          apply: () => addMapFog(),
        },
      },
      {
        title: 'Discover Locations',
        desc: 'Location and collectible markers on the map.',
        get unavailable() {
          return sharedProgressionUnavailable();
        },
        apply: () => discoverAllLocations(),
        reset: {
          title: 'Reset Locations',
          apply: () => undiscoverAllLocations(),
        },
      },
      {
        title: 'Unlock Fast Travel',
        desc: 'Safehouse and silo activities, which gate fast travel points. Also discovers their map markers when shared progression is disabled.',
        apply: () => unlockCharacterFastTravel(),
        reset: {
          title: 'Reset Fast Travel',
          apply: () => removeCharacterFastTravel(),
        },
      },
      {
        title: 'Complete Vaults',
        desc: 'Vault missions, doors, and locks. Also unlocks vault powers, which are reset separately.',
        apply: () => completeVaults(),
        marks: ['character:vault-powers'],
        reset: {
          title: 'Reset Vaults',
          apply: () => resetVaults(),
        },
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
        ['all', 'All Missions', 'Story and side missions. Activities are separate.'],
        ['story', 'Story Missions', 'Main story missions. Completing base game story also stages the epilogue so specializations unlock.'],
        ['side', 'Side Missions', 'Side, micro, and vault missions.'],
      ].map(([kind, noun, desc]) => ({
        key: kind,
        title: `Complete ${noun}`,
        desc,
        apply: () => completeMissions(kind, scope),
        reset: {
          title: `Reset ${noun}`,
          apply: () => removeMissions(kind, scope),
        },
      })),
  },
  {
    id: 'activities',
    title: 'Activities',
    saveType: 'any',
    scoped: true,
    typed: true,
    presets: (scope) =>
      [{ key: 'all', label: 'All Activities', desc: 'Every activity type.' }, ...ACTIVITY_TYPES].map(
        ({ key, label, desc }) => ({
          key,
          granular: key !== 'all',
          title: key === 'all' ? `Complete ${label}` : label,
          desc: desc || `${label}. Profile saves track these as shared progress toward Echo tokens.`,
          unavailable: !activityHasContent(key, scope, isProfileSave),
          apply: () => completeActivities(key, scope),
          reset: {
            title: key === 'all' ? `Reset ${label}` : label,
            apply: () => resetActivities(key, scope),
          },
        })
      ),
  },
  {
    id: 'world',
    title: 'World',
    saveType: 'profile',
    presets: [
      {
        title: 'Remove Map Fog',
        desc: 'Fog of war on every map.',
        apply: () => clearMapFog(),
        reset: {
          title: 'Restore Map Fog',
          apply: () => addMapFog(),
        },
      },
      {
        title: 'Discover Locations',
        desc: 'Location and collectible markers on the map.',
        apply: () => discoverAllLocations(),
        reset: {
          title: 'Reset Locations',
          apply: () => undiscoverAllLocations(),
        },
      },
      {
        title: 'Unlock Fast Travel',
        desc: 'Safehouse and silo activities, which gate fast travel points.',
        apply: () => unlockFastTravel(),
        reset: {
          title: 'Reset Fast Travel',
          apply: () => removeFastTravel(),
        },
      },
      {
        title: 'Unlock Vault Doors',
        desc: 'Vault doors, locks, and keys. Vault powers are separate.',
        apply: () => completeVaultObjects('doors'),
        reset: {
          title: 'Reset Vault Doors',
          apply: () => resetVaultObjects('doors'),
        },
      },
    ],
  },
  {
    id: 'progress',
    title: 'Collectibles',
    saveType: 'profile',
    scoped: true,
    typed: true,
    presets: (scope) =>
      [{ key: 'all', label: 'All Collectibles', desc: 'Every collectible type.' }, ...COLLECTIBLE_TYPES].map(
        ({ key, label, desc }) => ({
          key,
          granular: key !== 'all',
          title: key === 'all' ? `Unlock ${label}` : label,
          desc: desc || `${label}. Shared by all characters.`,
          unavailable: key !== 'all' && getSharedProgressSources('collectible', scope, key).length === 0,
          apply: () => completeSharedProgress('collectible', scope, key),
          reset: {
            title: key === 'all' ? `Reset ${label}` : label,
            apply: () => removeSharedProgress('collectible', scope, key),
          },
        })
      ),
  },
  {
    id: 'unlocks',
    title: 'Unlocks & Items',
    saveType: 'profile',
    presets: [
      {
        title: 'Max SDU',
        desc: 'Purchases all SDU upgrades, granting Echo tokens if needed.',
        apply: () => setMaxSDU(),
      },
      {
        title: 'Unlock Vault Powers',
        desc: 'Powerups from completing vaults. Vault doors are separate.',
        apply: () => completeVaultObjects('powers'),
        reset: {
          title: 'Reset Vault Powers',
          apply: () => resetVaultObjects('powers'),
        },
      },
      {
        title: 'Unlock New Game Shortcuts',
        desc: 'Skip prologue, skip story, and specialization system options.',
        apply: () => unlockNewGameShortcuts(),
      },
      {
        title: 'Unlock Hover Drives',
        desc: 'All hover drive manufacturers and tiers.',
        apply: () => unlockAllHoverDrives(),
      },
      {
        title: 'Unlock Cosmetics',
        desc: '(Almost) all cosmetic items.',
        apply: () => unlockAllCosmetics(),
      },
      {
        title: `Bank Items to Level ${MAX_LEVEL}`,
        desc: `Re-levels every bank item serial to ${MAX_LEVEL}.`,
        apply: () => updateAllSerialLevels(),
      },
      {
        title: 'Add Items to Bank',
        desc: 'Paste item serials to add.',
        apply: () => showAddItemsPopup(),
        popup: true,
      },
    ],
  },
];

let presetMode = 'apply';
let saveLoaded = false;
// preset id -> 'applied' | 'reset', cleared on import.
// Scoped card ids are `${card.id}:${preset.key}:${scope}` so one run can mark the presets it covers.
const presetStatus = new Map();
// card id -> selected content scope for scoped cards
const cardScopes = {};
// card ids with the "By type" toggle on, remembered per browser
const TYPES_EXPANDED_KEY = 'bl4_types_expanded';
const expandedCards = new Set(loadExpandedCards());

function loadExpandedCards() {
  try {
    return JSON.parse(localStorage.getItem(TYPES_EXPANDED_KEY)) || [];
  } catch {
    return [];
  }
}

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
  const scroller = document.getElementById('preset-cards');
  scroller.innerHTML = '';
  // Cards flow into balanced columns so short cards don't leave gaps under them
  const container = createElement('div', 'preset-columns');
  scroller.appendChild(container);
  const activeSaveType = isProfileSave ? 'profile' : 'character';

  for (const card of PRESET_CARDS) {
    if (saveLoaded && card.saveType !== 'any' && card.saveType !== activeSaveType) continue;

    const cardEl = createElement('div', 'preset-card');
    const header = createElement('div', 'preset-group-header');
    header.appendChild(createElement('span', 'preset-card-title', card.title));
    if (!saveLoaded) {
      header.appendChild(createElement('span', 'preset-card-tag', `${card.saveType} save`));
    }
    const scope = card.scoped ? cardScopes[card.id] || 'all' : null;
    const expanded = expandedCards.has(card.id);
    if (card.typed) header.appendChild(createTypesToggle(card.id, expanded));
    if (card.scoped) header.appendChild(createScopeToggle(card.id, scope));
    cardEl.appendChild(header);

    const presets = card.scoped ? card.presets(scope) : card.presets;
    const grid = createElement('div', 'preset-grid');
    presets.forEach((preset, i) => {
      if (preset.granular && !expanded) return;
      const id = card.scoped ? `${card.id}:${preset.key}:${scope}` : `${card.id}:${preset.id ?? i}`;
      const onRun = card.scoped
        ? (status) => markScopedStatus(card, preset.key, scope, status)
        : (status) => {
            presetStatus.set(id, status);
            if (status === 'applied') for (const other of preset.marks || []) presetStatus.set(other, status);
          };
      const btn = createPresetButton(preset, id, onRun);
      if (preset.key === 'all') btn.classList.add('preset-btn-wide');
      grid.appendChild(btn);
    });
    cardEl.appendChild(grid);

    container.appendChild(cardEl);
  }
}

/**
 * Records a scoped preset run. The status also applies to every available preset it covers
 * ('all' key covers every key, 'all' scope covers base and DLC). Presets that cover this one
 * without being covered by it now have mixed state, so their status is cleared.
 */
function markScopedStatus(card, key, scope, status) {
  const scopes = scope === 'all' ? CONTENT_SCOPES.map((s) => s.key) : [scope];
  const covered = new Set();
  for (const s of scopes) {
    for (const preset of card.presets(s)) {
      if (preset.unavailable || (key !== 'all' && preset.key !== key)) continue;
      covered.add(`${card.id}:${preset.key}:${s}`);
    }
  }
  for (const k of new Set([key, 'all'])) {
    for (const s of new Set([scope, 'all'])) {
      const id = `${card.id}:${k}:${s}`;
      if (!covered.has(id)) presetStatus.delete(id);
    }
  }
  for (const id of covered) presetStatus.set(id, status);
}

function createTypesToggle(cardId, expanded) {
  const btn = createElement('button', 'types-toggle', 'By type');
  btn.classList.toggle('active', expanded);
  btn.setAttribute('aria-pressed', String(expanded));
  btn.title = expanded ? 'Hide per-type presets' : 'Show per-type presets';
  btn.onclick = () => {
    if (expanded) expandedCards.delete(cardId);
    else expandedCards.add(cardId);
    try {
      localStorage.setItem(TYPES_EXPANDED_KEY, JSON.stringify([...expandedCards]));
    } catch {}
    renderPresets();
  };
  return btn;
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
 * Creates a fixed-size tile for a preset in the current mode. The description is hover text.
 */
function createPresetButton(preset, id, onRun) {
  const resetting = presetMode === 'reset';
  const action = resetting ? preset.reset : preset;

  const btn = createElement('button', 'secondary preset-btn');
  btn.appendChild(createElement('span', 'preset-title', action ? action.title : preset.title));
  btn.title = preset.desc;
  if (preset.unavailable) {
    btn.title += '\n' + (typeof preset.unavailable === 'string' ? preset.unavailable : 'No content in the selected scope.');
  }
  else if (!action) btn.title += "\nCan't be reset.";

  const status = presetStatus.get(id);
  if (status) btn.classList.add(status === 'applied' ? 'preset-applied' : 'preset-reset');

  if (!action || preset.unavailable) {
    btn.disabled = true;
    return btn;
  }

  btn.onclick = () => runPreset(action, resetting, onRun);
  return btn;
}

function runPreset(action, resetting, onRun) {
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
  showToast(message, resetting ? 'reset' : 'apply');
  onRun(resetting ? 'reset' : 'applied');
  renderPresets();
}

function setPresetMode(mode) {
  presetMode = mode;
  document.body.classList.toggle('reset-mode', mode === 'reset');
  for (const [btnId, btnMode] of [
    ['modeApplyBtn', 'apply'],
    ['modeResetBtn', 'reset'],
  ]) {
    const btn = document.getElementById(btnId);
    btn.classList.toggle('active', btnMode === mode);
    btn.setAttribute('aria-pressed', String(btnMode === mode));
  }
  renderPresets();
}

// Renamed from bl4_editor_collapsed when the default flipped to shown, since that key was written on every load
const EDITOR_COLLAPSED_KEY = 'bl4_editor_hidden';

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
 * Shows a short-lived notification. kind: 'apply' | 'reset' | 'info' | 'error'
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

  // Re-render presets when a manual edit changes state they depend on
  let lastSharedProgression = isSharedProgressionEnabled();
  let changeTimer;
  editor.onDidChangeModelContent(() => {
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => {
      const shared = isSharedProgressionEnabled();
      if (shared === lastSharedProgression) return;
      lastSharedProgression = shared;
      renderPresets();
    }, 300);
  });
});

/**
 * Unavailable reason for character presets that only apply without shared progression.
 */
function sharedProgressionUnavailable() {
  return isSharedProgressionEnabled() && 'Stored in the profile save while shared progression is enabled.';
}

/**
 * Whether the loaded character save uses shared progression. The game treats a missing flag as enabled.
 * Reads the editor text directly so it's cheap enough to check on every render.
 */
function isSharedProgressionEnabled() {
  if (!editor) return true;
  return !/^\s*using_shared_progression:\s*false\s*$/m.test(editor.getValue());
}

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
  const badge = document.getElementById('save-type-badge');
  badge.textContent = isProfileSave ? 'Loaded profile (shared) save' : 'Loaded character save';
  badge.dataset.saveType = isProfileSave ? 'profile' : 'character';
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

  setEditorCollapsed(localStorage.getItem(EDITOR_COLLAPSED_KEY) === '1');
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
          <li>Use the <strong>Presets</strong> panel for common one-click changes. Hover a preset for details. Switch to <strong>Remove</strong> to undo supported presets.</li>
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
