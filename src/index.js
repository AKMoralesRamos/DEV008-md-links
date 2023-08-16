//const colors = require('colors');
/* const { error } = require('console'); */
const {
  pathIsAbsolute,
  routeIsValid,
  isMdFile,
  readFile,
  findLinks,
  statusLink,
} = require("./config.js");

const mdLinks = (route, options = { validate: false }) => {
  return new Promise((resolve, reject) => {
    const absolutePath = pathIsAbsolute(route);
    routeIsValid(absolutePath)
      .then(() => {
        const isMd = isMdFile(absolutePath);
        if (isMd) {
          readFile(absolutePath)
            .then((data) => {
              const downLinks = findLinks(data, absolutePath);
              const linkPromises = downLinks.map((link) => {
                // return statusLink(link.href)
                if (options.validate) {
                  return statusLink(link.href)
                    .then((status) => ({
                      href: link.href,
                      text: link.text,
                      file: link.file,
                      status: status.statusCode,
                      ok: status.message,
                    }))
                    .catch((error) => {
                      return Promise.reject(error);
                    });
                } else {
                  return {
                    href: link.href,
                    text: link.text,
                    file: link.file,
                  };
                }
              });

              Promise.all(linkPromises)
                .then((linkResults) => {
                  resolve(linkResults);
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

mdLinks("./prueba.md", { validate: true })
  .then((links) => {
    console.log(links);
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = { mdLinks };
