const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// Load environment variables from Railway
const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

// Safety check
if (!token) {
  console.error("❌ BOT_TOKEN is missing. Set it in Railway Variables.");
  process.exit(1);
}

if (!clientId) {
  console.error("❌ CLIENT_ID is missing. Set it in Railway Variables.");
  process.exit(1);
}

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Define your slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
].map(cmd => cmd.toJSON());

// Register commands
(async () => {
  try {
    console.log("Registering global application commands...");

    const rest = new REST({ version: '10' }).setToken(token);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log("Commands registered successfully.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
})();

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Slash command handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

// Login
client.login(token);
