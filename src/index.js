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
    routeIsValid(absolutePath)
      .then(() => {
        const isMd = isMdFile(absolutePath);
        if (isMd) {
          readFile(absolutePath)
            .then((data) => {
              const downLinks = findLinks(data, absolutePath);
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


/*tengo este error FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript
heap out of memory

AI
El error "FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap
 out of memory" indica que el proceso de JavaScript se quedó sin memoria y no pudo asignar más espacio
  en el montón (heap). Esto puede ocurrir cuando se está trabajando con una gran cantidad de datos o
  cuando hay una fuga de memoria en el código.

Para solucionar este problema, puedes intentar aumentar la memoria disponible para el proceso de
 JavaScript. Puedes hacerlo utilizando la siguiente bandera al ejecutar tu script:

node --max-old-space-size=4096 index.js
Esto aumentará el límite de memoria a 4 GB (puedes ajustarlo según tus necesidades). Si aún así
sigues experimentando el mismo error, es posible que debas optimizar tu código para reducir la cantidad
de memoria utilizada. Algunas estrategias para hacer esto incluyen:

Liberar recursos no utilizados: Asegúrate de liberar cualquier recurso (como conexiones a bases de datos)
 una vez que ya no sean necesarios.
Utilizar iteradores en lugar de cargar todos los datos en memoria: Si estás trabajando con grandes
conjuntos de datos, considera utilizar iteradores o generadores en lugar de cargar todos los datos en
 memoria al mismo tiempo.
Optimizar bucles y estructuras de datos: Revisa tu código para identificar posibles mejoras en bucles
y estructuras de datos que puedan reducir la cantidad de memoria utilizada.
Espero que esta información te sea útil para solucionar el problema. Si tienes alguna otra pregunta,
no dudes en preguntar. */
