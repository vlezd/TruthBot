const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const path = require("path");
const fs = require("fs");
const config = require("../config.json");
const { loadCategories } = require("./systems/categories");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Registering global application commands...");
    await rest.put(
      Routes.applicationCommands(config.bot.clientId),
      { body: commands }
    );
    console.log("Commands registered globally.");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: config.bot.presence }],
    status: "online"
  });
  loadCategories();
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: "There was an error executing this command.", ephemeral: true });
      }
    }
  } else {
    // Component / modal routing
    const tod = require("./commands/tod");
    try {
      await tod.handleComponent(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(config.token);
