const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getDailyQuests } = require("../systems/quests");
const config = require("../../config.json");

module.exports.data = new SlashCommandBuilder()
  .setName("truthbotquests")
  .setDescription("View your daily TruthBot quests");

module.exports.execute = async interaction => {
  const q = getDailyQuests(interaction.user.id);

  const embed = new EmbedBuilder()
    .setTitle("🎯 TruthBot Daily Quests")
    .setColor("Green")
    .addFields(
      { name: "Truths", value: `${q.quests.truths}/${config.xp.questTruthGoal}`, inline: true },
      { name: "Dares", value: `${q.quests.dares}/${config.xp.questDareGoal}`, inline: true },
      { name: "Categories", value: `${q.quests.categories.length}/${config.xp.questCategoryGoal}`, inline: true }
    );

  return interaction.reply({ embeds: [embed] });
};
