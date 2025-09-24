// YAML mission batches (zlib compressed + base64 encoded)
const MISSIONS_SAFEHOUSES = 'eJy9VVtqwzAQ/C/0DnuFPr58GbFYm3hBj+BdF9rTV4S0iYxsV2nkLyE0OzP7Qp5FOAYhNV8xEPbKH6yfRvBAQ5yEuucnAH9BnS8AGfI4oojDYOUa5JHDBQsgijpJB330J0dK9ufhwAHdLyzdE6dxfBxUYuhAx4luHjlYowMZi4ontIaSYmKmAjFA75D9GZ4efTKXziDR0XJYllSf1eDlgbmsyLzuI/PWSqY0Cc1yKontmtl7KzEfp6BpgWSHASxo3dGxO7btXxab9bmg1azNMqAqjWRnc7XZ6z+xNNu7JcFH9cQvfUjsYtVflPB1pZwFb1ZwLXizGktjV+06j60zncfWeZ7PQbXxAkGd+wLBSgrfi+/jdQ==';
const MISSIONS_STORY = 'eJylWU1z4zYMvXem/8E/Ye1k205uPWzbSy872V45EAVJjClSISk53l9fgP6Io0iiJPuUmARIPoJ4D3CtvFfWeAyiBmVE45S3pnFW27LFp82vv2w2PkBo/dNG2rrRGDDnL+uz4WnK9f9xL/wZ9MSfQhnQ7/M2G5u9iEI5H/xB1QJNzqb4wbLubb22rQn0h39Yu+2+h+VbztEHZ4+5tU5buffDO79YKNMpL9juAMfGKhMK6+jPDOR+2pJt9kprGqrB5OjS07W14TrdZ1aHebD6CkJAh7kmy/XYDrpZBjAf2KlGEEihcNaEDHLwCYxLG6yDupme5StCJ7N1Nj2NHdEmIAF3aJ2xJr0qGkKET+MwdQw+e2bHZvXvrHSEy3339cnFsrsqMQTroQh4TCAPuoMS6bW09Nin50LegZEY7DzMbIOmpME0smLmO1pwYYRIDpTAKtVUQNtIeOa7vSSBLw8zdnGzZXBoYF5gSBWOq0Pixnj5ww2qxj1ik4K4N7dsweUKzEIK2GV3c8DFxbKjcqa1HTpwslKmFBwGFAA+EYQnuqOIoRhQMw+bIchq7TFvjJcdsEaNKEKFgklOfEkkTF5GdJwzywQELWFUapWTcytOdvimRkjqYnTmWxHpbLtg7u0Ty2mxoDoYn71Lzb58JYTUj01ovKDch5Vtxy5+PGPv4P6UvVtzsxx/4ifkDlJIxpTJIVC2hhPcHJVTgA/iMipKNPRGiJnnZDofo+K1VaSKrh4SF3JzmMkVKqs5hVJOFzdZp7P8GpWvpo0PQPHJpjMWipg5awtBGd5Zgu44g/KFP5pQ0XNQhtaRWBMiXpwQDY5k4od0OogEec7gBL31tF9ONSMmQ2yxvYcttmviMIDeB6uVViGBfwwPXocyjFeZTmQYgk2cIopjN9pl8ut84tyK1azywXwEjqEld/csuCoLVFx7UOVWRonThEQqYI0FXqLhpWUFdTZG8EPHQ1LT99SZn30sO2xk5pzefdx+jA3MxdaHp83z9x/fbtmgQHpE4F4goWcD7JHfGMoEdXE0MnoNyUnQKRrlkiLY2r69KZ+Nick+xKgb5ddie2O8DFSpkRUp1gopgBzOzPWMh+IboIR0oKdPOqNLW12da1VWJAH6F9cb3yXGHxLjj4nxr4nx3xLjvyfG/+iPc7hdkSrUG4XvdMr0kuON57NETdcwU3l4XMSsZo1PLpbFXo20F9PmKbH5XjyRALADVDrGx9axkSfVoNAlCJyJTHAoE/maQypxeElVToeVkikeo9qaZKb1USmTa9p9WqEOGW3XGD2uMUrK7ZPgZ17WCttApGIS+fOUE3kN24aMqrZ4m6+L5fZqTv/sY1msRhUXt33uE6TOW1NhmWPm1BzhWBDI1nH9kuyQcatmDLhr3uhAtjQ4vs/RWnx1Luh7GIF3vAmwupJ6d7FoZRLYoYR6Ss7I1nnrohIny6fNw/BeJFUIbVdxC7w+EJvSGzK+QBdaulR1G0ej8cbF89Pm3+jqx3//iL/Orp7Prp7PrsTf3/8U32hyf+1MU1Kswe0pPuYu+24dXIsce7N3OrQFOjYPLbgCj0xrBfMl89bqbvWQm2XP2xdaXNsCvgFJWX2WpGHDSB2U2oDwn9na+9hgn3p0/RjcpuEY8j0ZBuPGq3Jl5PWfYBLMWCHkDBvzCIFN6BMBtUYqLS61yUjDahrN1WXYoJulR+eG20wRHdseQInoEDvELoHXNT7j1AtE/ugD1gnWcNgQbQnS+vxz0tVWOgoqCXquEx945ULbA3dLDxCrc5IN9PwgV4meCp/2tcWUUoh8eP6tyCNFP1f+L1TvzeHRXutl0qBpz32xHDslE9hfGow8v2gxUQF66LgF9vGsg0oqygqUlZVWxydgR/rJ113ThyQUkxcJQjKcPX03Ov1/6FoQEw==';

// Helper to decode, decompress, and parse YAML
function loadMissionBatch(b64) {
  const compressed = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const yamlBytes = pako.inflate(compressed);
  const yamlText = new TextDecoder().decode(yamlBytes);
  return jsyaml.load(yamlText);
}

// Merge mission batch into save data (overwrite keys)
function mergeMissionBatch(missionTemplate) {
  const yamlText = editor.getValue();
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML: " + e);
    return;
  }

  const missionBatch = loadMissionBatch(missionTemplate);

  if (!data.missions) data.missions = {};
  if (!data.missions.local_sets) data.missions.local_sets = {};
  const target = data.missions.local_sets;
  for (const key in missionBatch) {
    target[key] = missionBatch[key];
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
}

function unlockAllSafehouses() {
  mergeMissionBatch(MISSIONS_SAFEHOUSES);
  alert("Safehouse missions completed!");
}

function skipStory() {
  mergeMissionBatch(MISSIONS_STORY);
  setStoryValues(); // values.js
  alert("Story missions completed!");
}
