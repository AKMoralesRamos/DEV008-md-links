//const colors = require('colors');
/* const { error } = require('console'); */
const {pathIsAbsolute,
  routeIsValid,
  isMdFile,
  readFile,
  findLinks,
  statusLink
} = require('./config.js');

const mdLinks = (route, options = { validate: false }) => {
  return new Promise((resolve, reject) => {
    const absolutePath = pathIsAbsolute(route);
    console.log(absolutePath);
    routeIsValid(absolutePath)
      .then(() => {
        const isMd = isMdFile(absolutePath);
        console.log(isMd);
        if (isMd) {
          readFile(absolutePath)
            .then((data) => {
              console.log(data);
              const downLinks = findLinks(data, absolutePath);
              console.log(downLinks);
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
                      console.error('Algo salió mal:', error);
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
                  console.error('Algo salió mal:', error);
                  reject(error);
                });
            })
            .catch((error) => {
              console.error('Algo salió mal x2:', error);
              reject(error);
            });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        reject(error);
      });
  });
};


mdLinks('./prueba.md', { validate: true })
  .then((links) => {
    console.log(links);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

module.exports = { mdLinks };


