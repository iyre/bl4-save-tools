// bl4web.js

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
let editor;
require(['vs/editor/editor.main'], function() {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '', // initial YAML text
    language: 'yaml',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false }
  });
});

let importFilename = 'imported';

function enableSections() {
  document.getElementById('modSectionOverlay').style.display = 'none';
  document.getElementById('yamlSectionOverlay').style.display = 'none';
}

async function importFile() {
  const file = document.getElementById('savInput').files[0];
  if (!file) { alert("Please select a file to upload."); return; }
  const arrayBuffer = await file.arrayBuffer();

  importFilename = file.name.split('.').slice(0, -1).join('.') || file.name;

  // Exit early if YAML file provided (already decrypted)
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext == 'yaml' || ext == 'yml') {
    console.log("Loading YAML file directly into editor");
    let yamlText = new TextDecoder().decode(arrayBuffer);
    editor.setValue(yamlText);
    enableSections();
    return;
  }

  decryptSav(arrayBuffer)
  enableSections();
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

// Restore user ID from localStorage on page load
window.addEventListener('DOMContentLoaded', function() {
  const previousUserId = localStorage.getItem('bl4_previous_userid');
  if (previousUserId) {
    document.getElementById('userIdInput').value = previousUserId;
  }
});
