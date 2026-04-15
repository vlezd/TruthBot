const fs = require("fs");
const path = require("path");
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const config = require("../../config.json");

let categories = {};

function loadCategories() {
  const folder = path.resolve(config.paths.categories);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const files = fs.readdirSync(folder).filter(f => f.endsWith(".json"));
  categories = {};

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(folder, file), "utf8"));
    const name = file.replace(".json", "");
    categories[name] = data;
  }
  return categories;
}

function getCategories() {
  if (!Object.keys(categories).length) loadCategories();
  return categories;
}

function buildCategoryMenu(language = "en") {
  const cats = getCategories();
  const menu = new StringSelectMenuBuilder()
    .setCustomId("category_select")
    .setPlaceholder("Choose a category");

  Object.entries(cats).forEach(([key, data]) => {
    if (data.language && data.language !== language) return;
    menu.addOptions({
      label: key,
      value: key,
      emoji: data.emoji || "🎲",
      description: data.description || "No description provided"
    });
  });

  return new ActionRowBuilder().addComponents(menu);
}

module.exports = { loadCategories, getCategories, buildCategoryMenu };
