/**
 * Calculator module for game mechanics and progression systems.
 * Currently implements XP calculators for character levels and specializations,
 * using curve-fitted polynomial functions based on collected game data.
 */

// Define exact XP values for common levels to avoid calculation which isn't perfectly accurate.
const CHARACTER_LEVEL_XP = {
  50: 3430227,
};

function runCharCalc() {
  const lvl = parseInt(document.getElementById('charLevelInput').value, 10);
  const xp = calculateCharacterXp(lvl);
  renderXpResult('charXpResult', xp);
}

function runSpecCalc() {
  const lvl = parseInt(document.getElementById('specLevelInput').value, 10);
  const xp = calculateSpecializationXp(lvl);
  renderXpResult('specXpResult', xp);
}

function renderXpResult(containerId, xp, color) {
  const container = document.getElementById(containerId);
  if (isNaN(xp) || xp < 1) {
    container.textContent = 'Enter a valid level.';
    return;
  }
  const xpStr = xp.toLocaleString();
  const xpRaw = xp.toString();
  container.textContent = `Est. total XP required: ${xpStr}`;
  container.innerHTML += `
    <button onclick="navigator.clipboard.writeText('${xpRaw}')"
      title="Copy raw value" style="font-size:0.95em;padding:0.2em 0.8em;margin-left:6px;">Copy</button>
  `;
}

/**
 * Calculates total XP required to reach a specific character level.
 * Uses hardcoded values for levels 1-10 and a curve-fitted cubic polynomial for 11+.
 * Data derived from data/xp_character.csv with applied safety margins.
 *
 * @param {number} level - The target character level
 * @returns {number} Total XP required to reach the level, or 0 if invalid
 */
function calculateCharacterXp(level) {
  // Hardcoded total XP for levels 1-10
  const hardcoded = [0, 857, 1740, 3349, 5875, 9496, 14385, 20707, 28625, 38297];
  if (level > 0 && level <= 10) {
    return hardcoded[level - 1];
  }

  const base =
    20.43597 * Math.pow(level, 3) +
    445.42202 * Math.pow(level, 2) +
    -5301.02934 * level +
    27953.516161;
  // Safety margin: 1.8%
  return Math.round(base * 1.018);
}

/**
 * Calculates total XP required to reach a specific specialization level.
 * Uses segmented curve fitting with different polynomials for different level ranges:
 * - Levels 1-10: Hardcoded values
 * - Levels 11-31: Cubic polynomial with 1.8% safety margin
 * - Levels 32-200: Cubic polynomial with 2.6% safety margin
 * - Levels 201-499: Cubic polynomial with 0.01% safety margin
 * - Levels 500+: Cubic polynomial with 0.001% safety margin
 *
 * Data derived from data/xp_specialization.csv
 *
 * @param {number} level - The target specialization level
 * @returns {number} Total XP required to reach the level, or 0 if invalid
 */
function calculateSpecializationXp(level) {
  // Hardcoded total XP for levels 1-10
  const hardcoded = [
    0, // Level 1
    1143, // Level 2
    2320, // Level 3
    4466, // Level 4
    7834, // Level 5
    12662, // Level 6
    19180, // Level 7
    27609, // Level 8
    38167, // Level 9
    51062, // Level 10
  ];
  if (level > 0 && level <= 10) {
    return hardcoded[level - 1];
  }

  // Segment 1: levels 11–31
  if (level >= 11 && level <= 31) {
    const base =
      83.390778 * Math.pow(level, 3) +
      -2314.676389 * Math.pow(level, 2) +
      41061.771085 * level +
      -216525.913214;
    // Safety margin: 1.8%
    return Math.round(base * 1.018);
  }

  // Segment 2: levels 32–200
  if (level >= 32 && level <= 200) {
    const base =
      20.903278 * Math.pow(level, 3) +
      1701.31766 * Math.pow(level, 2) +
      -74334.753724 * level +
      1403361.683375;
    // Safety margin: 2.6%
    return Math.round(base * 1.026);
  }

  // Segment 3: levels 201–499
  if (level >= 201 && level <= 499) {
    const base =
      16.708444 * Math.pow(level, 3) +
      4297.272805 * Math.pow(level, 2) +
      -645890.804295 * level +
      46158303.367444;
    // Safety margin: 0.01%
    return Math.round(base * 1.0001);
  }

  // Segment 4: levels 500+
  if (level >= 500) {
    const base =
      14.960904 * Math.pow(level, 3) +
      6708.446543 * Math.pow(level, 2) +
      -1773218.961259 * level +
      224787945.740717;
    // Safety margin: 0.001%
    return Math.round(base * 1.00001);
  }

  return 0;
}
