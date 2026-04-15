const config = require("../../config.json");
const cooldowns = new Map();

function checkCooldown(userId) {
  const now = Date.now();
  if (cooldowns.has(userId)) {
    const expires = cooldowns.get(userId);
    if (now < expires) return expires - now;
  }
  cooldowns.set(userId, now + config.cooldowns.buttonCooldownMs);
  return 0;
}

module.exports = { checkCooldown };
