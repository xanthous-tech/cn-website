require('dotenv').config();
const withImages = require('next-images');

module.exports = withImages({
  env: {
    yuqueToken: process.env.YUQUE_TOKEN,
  },
});
