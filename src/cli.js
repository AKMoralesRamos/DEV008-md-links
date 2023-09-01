const { mdLinks } = require('./index');

const route = process.argv[2]
const validateOption = process.argv.includes('--validate');
const statsOption = process.argv.includes('--stats');

const options = {
  validate: validateOption,
  stats: statsOption,
}

mdLinks(route, options)
  .then((result) => {
    if (options.validate && options.stats) {
      console.log(result);
    } else if (options.validate) {
      console.log(result);
    } else if (options.stats) {
      console.log(result);
    } else {
      console.log(result);
    }
  })
  .catch((error) => {
    console.error(error);
});
