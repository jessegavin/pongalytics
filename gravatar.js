var md5 = require("MD5");

module.exports = function(email) {
  return "http://www.gravatar.com/avatar/" + md5(email.trim().toLowerCase());
};