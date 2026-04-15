const path = require("path");
const config = require("../../config.json");
const { readJSON, writeJSON } = require("../utils/fileManager");

const xpPath = path.resolve(config.paths.xp);

function loadXP() {
  return readJSON(xpPath, {});
}

function saveXP(data) {
  writeJSON(xpPath, data);
}

function getLevel(xp) {
  let level = 0;
  while (xp >= 50 * (level + 1) * (level + 1)) level++;
  return level;
}

function addXP(userId, amount) {
  const data = loadXP();
  if (!data[userId]) {
    data[userId] = { xp: 0, level: 0, streak: 0, lastPlay: null };
  }

  data[userId].xp += amount;
  const newLevel = getLevel(data[userId].xp);
  const leveledUp = newLevel > data[userId].level;
  data[userId].level = newLevel;

  saveXP(data);
  return { leveledUp, level: newLevel, stats: data[userId] };
}

module.exports = { loadXP, saveXP, addXP };
