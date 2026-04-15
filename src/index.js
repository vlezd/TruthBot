const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const path = require("path");
const fs = require("fs");
const { loadCategories } = require("./systems/categories");

// Load Railway environment variables
const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const presence = process.env.PRESENCE || "Truth or Dare";

// Safety checks
if (!token) {
  console.error("❌ BOT_TOKEN missing in Railway Variables");
  process.exit(1);
}

if (!clientId) {
  console.error("❌ CLIENT_ID missing in Railway Variables");
  process.exit(1);
}

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

// Register slash commands using ENV token
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registering global application commands...");
    await rest.put(
      Routes.applicationCommands(clientId),
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
    activities: [{ name: presence }],
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
    const tod = require("./commands/tod");
    try {
      await tod.handleComponent(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(token);
