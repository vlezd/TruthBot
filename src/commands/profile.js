const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadXP } = require("../systems/xp");

module.exports.data = new SlashCommandBuilder()
  .setName("truthbotprofile")
  .setDescription("View your TruthBot profile");

module.exports.execute = async interaction => {
  const data = loadXP();
  const user = data[interaction.user.id];

  if (!user) {
    return interaction.reply("You haven't played TruthBot yet!");
  }

  const embed = new EmbedBuilder()
    .setTitle(`🤖 TruthBot Profile — ${interaction.user.username}`)
    .setColor("Blue")
    .addFields(
      { name: "Level", value: `${user.level}`, inline: true },
      { name: "XP", value: `${user.xp}`, inline: true },
      { name: "Streak", value: `${user.streak || 0} days`, inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL());

  return interaction.reply({ embeds: [embed] });
};
