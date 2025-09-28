// Functions for handling UI setup and interaction

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
let editor;
require(['vs/editor/editor.main'], function() {
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
  if (!file) { alert("Please select a file to upload."); return; }
  const arrayBuffer = await file.arrayBuffer();

  importFilename = file.name.split('.').slice(0, -1).join('.') || file.name;

  // Exit early if YAML file provided (already decrypted)
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext == 'yaml' || ext == 'yml') {
    console.log("Loading YAML file directly into editor");
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
  console.log("YAML preview:", yamlText.slice(0, 100));
  console.log("YAML length:", yamlBytes.length);

  // Remove !tags which jsyaml can't handle. These don't seem to be needed.
  yamlText = yamlText.replace(/:\s*!tags/g, ':');
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML after tag removal: " + e);
    return;
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
  const blob = new Blob([yamlText], { type: "text/yaml" });
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
    alert("Failed to parse YAML: " + e);
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
    setTimeout(() => { el.style.display = 'none'; }, 300);
    presetNotificationTimeout = null;
  }, duration);
}

// Restore user ID from localStorage on page load
window.addEventListener('DOMContentLoaded', function() {
  const previousUserId = localStorage.getItem('bl4_previous_userid');
  if (previousUserId) {
    document.getElementById('userIdInput').value = previousUserId;
  }
});

// Clear editor when selecting a new file
document.getElementById('fileInput').addEventListener('change', function() {
  if (editor) editor.setValue('');
});
