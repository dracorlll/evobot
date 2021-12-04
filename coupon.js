const crypto = require('crypto');

const coupon = crypto.randomBytes(24).toString("hex")

console.log(coupon);
console.log(require("./db/index"))