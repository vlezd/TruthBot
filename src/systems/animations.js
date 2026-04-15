const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.json");
const { getCategories } = require("./categories");

function getGlowFrames(color) {
  switch ((color || "blue").toLowerCase()) {
    case "red": return ["🔴", "🟥", "✨", "🟥"];
    case "green": return ["🟢", "🟩", "✨", "🟩"];
    case "yellow": return ["🟡", "🟨", "✨", "🟨"];
    case "purple": return ["🟣", "🟪", "✨", "🟪"];
    default: return ["🔵", "🔷", "✨", "🔷"];
  }
}

function buildGlowButtons(category, frame) {
  const cats = getCategories();
  const data = cats[category];
  const frames = getGlowFrames(data.glowColor);
  const emoji = frames[frame];

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`truth_${category}`)
      .setLabel("Truth")
      .setEmoji(emoji)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`dare_${category}`)
      .setLabel("Dare")
      .setEmoji("🔥")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`submit_prompt_${category}`)
      .setLabel("Submit Prompt")
      .setStyle(ButtonStyle.Secondary)
  );
}

function startGlowLoop(interaction, category) {
  const cats = getCategories();
  const frames = getGlowFrames(cats[category].glowColor);
  let frame = 0;

  const loop = setInterval(async () => {
    try {
      await interaction.editReply({
        components: [buildGlowButtons(category, frame)]
      });
      frame = (frame + 1) % frames.length;
    } catch {
      clearInterval(loop);
    }
  }, config.animations.glowSpeedMs);
}

function buildCategoryLoadingEmbed() {
  return new EmbedBuilder()
    .setTitle("Loading category…")
    .setDescription("Preparing prompts…")
    .setColor("Grey");
}

function buildCategoryFinalEmbed(category) {
  const cats = getCategories();
  const data = cats[category];

  return new EmbedBuilder()
    .setTitle(`🤖 TruthBot — ${data.emoji} ${category}`)
    .setDescription(data.description || "Choose Truth or Dare")
    .setColor(data.glowColor || "Blue");
}

module.exports = {
  buildGlowButtons,
  startGlowLoop,
  buildCategoryLoadingEmbed,
  buildCategoryFinalEmbed
};
