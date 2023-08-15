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
    /* resolve(absolutePath); */
     routeIsValid(absolutePath)
      .then(() => {
        /* resolve("correcto"); */
        const isMd = isMdFile(absolutePath);
       /*  resolve(isMd); */
        if (isMd) {
          readFile(absolutePath)
            .then((data) => {
              /* resolve(data); */
              const downLinks = findLinks(data, absolutePath);
             /*  console.log(downLinks[2].href);
             statusLink(downLinks[2].href)
             .then((status) => {
              resolve(status);
             }) .catch((error) => {
              reject (error);
             }) */
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


mdLinks('./prueba.md', { validate: true })
  .then((links) => {
    console.log(links);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

module.exports = { mdLinks };


