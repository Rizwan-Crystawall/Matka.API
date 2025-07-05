const crypto = require("crypto");
function generateSignature(user_id, secret) {
  const data = `${user_id}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}
module.exports = { generateSignature };