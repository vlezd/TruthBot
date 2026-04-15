const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");
const config = require("../../config.json");
const { readJSON } = require("../utils/fileManager");
const { loadXP } = require("../systems/xp");

const leaderboardPath = path.resolve(config.paths.leaderboard);

module.exports.data = new SlashCommandBuilder()
  .setName("truthbotleaderboard")
  .setDescription("Show the TruthBot XP leaderboard");

module.exports.execute = async interaction => {
  const xpData = loadXP();
  const sorted = Object.entries(xpData)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10);

  const lines = sorted
    .map(([id, stats], i) =>
      `**${i + 1}.** <@${id}> — Level **${stats.level}** (${stats.xp} XP)`
    )
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("🏆 TruthBot XP Leaderboard")
    .setDescription(lines || "No XP data yet.")
    .setColor("Gold");

  return interaction.reply({ embeds: [embed] });
};
