const path = require("path");
const config = require("../../config.json");
const { readJSON, writeJSON } = require("../utils/fileManager");

const questsPath = path.resolve(config.paths.quests);

function getDailyQuests(userId) {
  const data = readJSON(questsPath, {});
  const today = new Date().toDateString();

  if (!data[userId] || data[userId].date !== today) {
    data[userId] = {
      date: today,
      quests: {
        truths: 0,
        dares: 0,
        categories: []
      }
    };
    writeJSON(questsPath, data);
  }

  return data[userId];
}

function updateQuests(userId, type, category) {
  const data = readJSON(questsPath, {});
  const today = new Date().toDateString();

  if (!data[userId] || data[userId].date !== today) {
    data[userId] = {
      date: today,
      quests: {
        truths: 0,
        dares: 0,
        categories: []
      }
    };
  }

  const q = data[userId].quests;
  if (type === "truth") q.truths++;
  if (type === "dare") q.dares++;
  if (!q.categories.includes(category)) q.categories.push(category);

  writeJSON(questsPath, data);
  return data[userId];
}

function computeQuestXP(q) {
  let questXP = 0;
  if (q.quests.truths >= config.xp.questTruthGoal) questXP += config.xp.questRewardXP;
  if (q.quests.dares >= config.xp.questDareGoal) questXP += config.xp.questRewardXP;
  if (q.quests.categories.length >= config.xp.questCategoryGoal) questXP += config.xp.questRewardXP;
  return questXP;
}

module.exports = { getDailyQuests, updateQuests, computeQuestXP };
