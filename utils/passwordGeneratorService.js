const crypto = require('crypto');
const path = require('path');


//password generator
// const crypto = require("crypto");

const shuffle = (str) => {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
};

const generateStrongPassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@$!%*?&";

  const all = upper + lower + numbers + special;

  const getRandomChar = (set) => {
    const index = crypto.randomInt(0, set.length);
    return set[index];
  };

  let password = "";

  // ✅ Ensure at least one from each category
  password += getRandomChar(upper);
  password += getRandomChar(lower);
  password += getRandomChar(numbers);
  password += getRandomChar(special);

  // ✅ Fill remaining (9 - 4 = 5 chars)
  for (let i = 0; i < 5; i++) {
    password += getRandomChar(all);
  }

  // 🔀 Shuffle (important!)
  password = password
    .split("")
    .sort(() => crypto.randomInt(0, 2) - 1)
    .join("");
  password = shuffle(password);
  return password;
};





module.exports = {  generateStrongPassword };