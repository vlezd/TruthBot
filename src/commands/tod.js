const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");
const path = require("path");
const config = require("../../config.json");
const { buildCategoryMenu, getCategories } = require("../systems/categories");
const { buildCategoryLoadingEmbed, buildCategoryFinalEmbed, startGlowLoop } = require("../systems/animations");
const { checkCooldown } = require("../systems/cooldowns");
const { addXP } = require("../systems/xp");
const { updateStreak } = require("../systems/streaks");
const { updateQuests, computeQuestXP } = require("../systems/quests");
const { readJSON, writeJSON } = require("../utils/fileManager");

const userPromptsPath = path.resolve(config.paths.userPrompts);

const reactions = {
  truth: ["💬", "🧠", "✨", "🔍"],
  dare: ["🔥", "⚡", "💥", "😈"]
};

module.exports.data = new SlashCommandBuilder()
  .setName("truthbot")
  .setDescription("Start a TruthBot Truth or Dare game")
  .addStringOption(opt =>
    opt.setName("language")
      .setDescription("Language code (e.g., en)")
      .setRequired(false)
  );

module.exports.execute = async interaction => {
  const language = interaction.options.getString("language") || "en";

  const embed = new EmbedBuilder()
    .setTitle("🤖 TruthBot")
    .setDescription("Choose a category to begin")
    .setColor("Blue");

  return interaction.reply({
    embeds: [embed],
    components: [buildCategoryMenu(language)]
  });
};

module.exports.handleComponent = async interaction => {
  const cats = getCategories();

  if (interaction.isStringSelectMenu() && interaction.customId === "category_select") {
    const category = interaction.values[0];
    if (!cats[category]) {
      return interaction.reply({ content: "Category not found.", ephemeral: true });
    }

    await interaction.update({
      embeds: [buildCategoryLoadingEmbed()],
      components: []
    });

    setTimeout(() => {
      interaction.editReply({
        embeds: [buildCategoryFinalEmbed(category)],
        components: [require("../systems/animations").buildGlowButtons(category, 0)]
      });
      startGlowLoop(interaction, category);
    }, config.animations.categoryRevealDelay);
  }

  if (interaction.isButton()) {
    const remaining = checkCooldown(interaction.user.id);
    if (remaining > 0) {
      return interaction.reply({
        content: `⏳ You're on cooldown for ${(remaining / 1000).toFixed(1)}s`,
        ephemeral: true
      });
    }

    const [type, category] = interaction.customId.split("_");
    if (!cats[category]) {
      return interaction.reply({ content: "Category not found.", ephemeral: true });
    }

    if (type === "submit") {
      const modal = new ModalBuilder()
        .setCustomId(`prompt_modal_${category}`)
        .setTitle("TruthBot — Submit a Truth or Dare");

      const typeInput = new TextInputBuilder()
        .setCustomId("type")
        .setLabel("Type (truth/dare)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const textInput = new TextInputBuilder()
        .setCustomId("text")
        .setLabel("Your prompt")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(typeInput),
        new ActionRowBuilder().addComponents(textInput)
      );

      return interaction.showModal(modal);
    }

    if (type === "truth" || type === "dare") {
      const data = cats[category];
      const list = data[type + "s"];
      const prompt = list[Math.floor(Math.random() * list.length)];
      const reaction = reactions[type][Math.floor(Math.random() * reactions[type].length)];

      const loading = new EmbedBuilder()
        .setTitle(`${reaction} Choosing your ${type}…`)
        .setColor(data.glowColor || "Blue");

      await interaction.reply({ embeds: [loading] });

      setTimeout(() => {
        const streak = updateStreak(interaction.user.id);
        const streakBonus = streak * config.xp.streakBonusPerDay;
        const baseXP = type === "truth" ? config.xp.truthXP : config.xp.dareXP;
        const multiplier = data.xpMultiplier || 1;
        const totalBase = Math.round((baseXP + streakBonus) * multiplier);

        const questData = updateQuests(interaction.user.id, type, category);
        const questXP = computeQuestXP(questData);
        const totalXP = totalBase + questXP;

        const { leveledUp, level, stats } = addXP(interaction.user.id, totalXP);

        const final = new EmbedBuilder()
          .setTitle(`🤖 TruthBot — ${reaction} ${type.toUpperCase()} (${category})`)
          .setDescription(prompt)
          .setColor(data.glowColor || "Blue")
          .addFields(
            { name: "⭐ XP Earned", value: `Base + streak + quests = **${totalXP} XP**`, inline: false },
            { name: "🔥 Streak", value: `Day **${streak}** (+${streakBonus} XP)`, inline: true }
          );

        if (questXP > 0) {
          final.addFields({
            name: "🎯 Daily Quests",
            value: `You gained **${questXP} XP** from quests`
          });
        }

        if (leveledUp) {
          final.addFields({
            name: "🎉 Level Up!",
            value: `<@${interaction.user.id}> reached **Level ${level}**`
          });
        } else {
          final.addFields({
            name: "Level",
            value: `Level **${stats.level}** (${stats.xp} XP total)`
          });
        }

        interaction.editReply({ embeds: [final] });
      }, config.animations.truthDareRevealDelay);
    }
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("prompt_modal_")) {
    const category = interaction.customId.replace("prompt_modal_", "");
    const type = interaction.fields.getTextInputValue("type").toLowerCase();
    const text = interaction.fields.getTextInputValue("text");

    if (!["truth", "dare"].includes(type)) {
      return interaction.reply({ content: "Invalid type. Use 'truth' or 'dare'.", ephemeral: true });
    }

    const data = readJSON(userPromptsPath, { truths: [], dares: [] });
    data[type + "s"].push(text);
    writeJSON(userPromptsPath, data);

    return interaction.reply({ content: "Thanks for your submission!", ephemeral: true });
  }
};
