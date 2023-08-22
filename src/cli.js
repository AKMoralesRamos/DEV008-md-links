const mdLinks = require('./index.js');
const colors = require('colors');

const route = process.argv[2]
const validateOption = process.argv.includes('--validate');
const statsOption = process.argv.includes('--stats');

if (validateOption && statsOption) {
  mdLinks(route, { validate: true, stats: true })
    .then((links) => {
      console.log(colors.blue(links));
    })
    .catch((err) => {
      console.log(colors.red(err));
    });
  }


