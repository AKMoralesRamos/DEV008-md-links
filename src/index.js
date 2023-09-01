const {
  pathIsAbsolute,
  routeIsValid,
  isMdFileOrDirectory,
  readFileOrDirectory,
  readFiles,
  findLinks,
  statusLink,
  justStats,
  statsWithValidate,
} = require("./config.js");

const mdLinks = (route, options = { validate: false, stats: false }) => {
  return new Promise((resolve, reject) => {
    const absolutePath = pathIsAbsolute(route);
   routeIsValid(absolutePath)
      .then(() => {
        const itIs = isMdFileOrDirectory(absolutePath);
         if (itIs) {
          const filesArray = readFileOrDirectory(absolutePath);
          readFiles(filesArray)
            .then((data) => {
              const downLinks = findLinks(data);
              const linkPromises = downLinks.map((link) => {
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
                 if (options.stats) {
                  const statsResult = options.validate ? statsWithValidate(linkResults) : justStats(linkResults);
                  resolve(statsResult);
                }  else {
                  resolve(linkResults);
                }
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

/* mdLinks("./archivos", { validate: true, stats: false })
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  }); */

module.exports = { mdLinks };
