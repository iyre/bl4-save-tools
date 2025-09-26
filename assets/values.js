function loadCollectibles() {
  const compressed = Uint8Array.from(atob(COLLECTIBLES_COMPRESSED), c => c.charCodeAt(0));
  const yamlBytes = pako.inflate(compressed);
  const yamlText = new TextDecoder().decode(yamlBytes);
  return jsyaml.load(yamlText);
}

function completeAllCollectibles() {
  // Load the collectibles from the compressed string
  const allCollectibles = loadCollectibles();

  // Get the current YAML from the editor
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  // Ensure the path exists
  data.stats = data.stats || {};
  data.stats.openworld = data.stats.openworld || {};
  data.stats.openworld.collectibles = data.stats.openworld.collectibles || {};

  // For each top-level key in the template, add/overwrite child keys individually to avoid removing unexpected keys.
  for (const [category, values] of Object.entries(allCollectibles)) {
    data.stats.openworld.collectibles[category] = data.stats.openworld.collectibles[category] || {};
    // If the value is an object, copy keys individually
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      for (const [k, v] of Object.entries(values)) {
        // If nested object (e.g., echologs_general), handle one more level
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          data.stats.openworld.collectibles[category][k] = data.stats.openworld.collectibles[category][k] || {};
          for (const [kk, vv] of Object.entries(v)) {
            data.stats.openworld.collectibles[category][k][kk] = vv;
          }
        } else {
          data.stats.openworld.collectibles[category][k] = v;
        }
      }
    } else {
      // For non-object values, just assign
      data.stats.openworld.collectibles[category] = values;
    }
  }

  // Update the editor with the new YAML
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  alert("Collectibles applied!");
}

function unlockUVHMode() {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  data.globals = data.globals || {};
  data.globals.highest_unlocked_vault_hunter_level = 5;
  data.globals.vault_hunter_level = 1;

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  alert("UVH Mode Unlocked!");
}

function setStoryValues() {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  // Set globals
  data.globals = data.globals || {};
  data.globals.lockdownlifted = true; // what does this do?

  // Set stats.challenge // some of these are updated automatically, so aren't set here
  data.stats.challenge = data.stats.challenge || {};
  data.stats.challenge.mission_main_all = 18;

  // Set unlockables.character_progress.entries (append if not present) - not sure what this does, but set it to be safe
  data.unlockables = data.unlockables || {};
  data.unlockables.character_progress = data.unlockables.character_progress || {};
  let entries = data.unlockables.character_progress.entries || [];
  if (!entries.includes('character_progress.seen_credits')) {
    entries.push('character_progress.seen_credits');
  }
  data.unlockables.character_progress.entries = entries;

  // Update editor
  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  alert("Story skip values set!");
}
