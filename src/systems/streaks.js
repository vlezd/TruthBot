const path = require("path");
const config = require("../../config.json");
const { readJSON, writeJSON } = require("../utils/fileManager");

const xpPath = path.resolve(config.paths.xp);

function updateStreak(userId) {
  const data = readJSON(xpPath, {});
  const today = new Date().toDateString();

  if (!data[userId]) {
    data[userId] = { xp: 0, level: 0, streak: 0, lastPlay: null };
  }

  const last = data[userId].lastPlay;

  if (last === today) {
    writeJSON(xpPath, data);
    return data[userId].streak;
  }

  if (last) {
    const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
    if (diff === 1) data[userId].streak++;
    else data[userId].streak = 1;
  } else {
    data[userId].streak = 1;
  }

  data[userId].lastPlay = today;
  writeJSON(xpPath, data);
  return data[userId].streak;
}

module.exports = { updateStreak };
