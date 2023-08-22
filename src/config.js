const path = require('path');
const fs = require('fs');
const https = require('https');

// Funciones puras

// Validar ruta, convertir a ruta absoluta.

const pathIsAbsolute = (route) => {
  if (!path.isAbsolute(route)) {
    return path.resolve(route);
  } else
  return route;
};


// Validar que la ruta absoluta exista o no

const routeIsValid = (route) => {
  return new Promise((resolve, reject) => {
      fs.access(route, fs.constants.F_OK, (err) => {
          if (err) {
              reject('La ruta no es válida');
          } else {
            resolve(true);
          }
      });
  });
};

// Validar si el archivo tiene una extensión .md

const isMdFile = (route) => {
  const mdFile = path.extname(route);
  if (mdFile !== ".md") {
    throw new Error('No se encontraron archivos .md');
  } else {
    return true;
  }
};

// Si el archivo es .md haremos la lectura del archivo.

const readFile = (route) => {
  return new Promise((resolve, reject) => {
    fs.readFile(route, (err, data) => {
      if (err) {
        reject('No se puede leer el archivo');
      } else {
        resolve(data.toString());
      }
    });
  });
}


// Ahora con la lectura del archivo, buscaremos el texto y link en base a
// una expresión regular.

const findLinks = (content, filePath) => {
  const linksArray = [];
  const RegExpFindLinks = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(((?:https?|ftp|file|http):\/\/[^\)]+)\))/gi;

  const matches = content.matchAll(RegExpFindLinks);
for (const match of matches) {
    const text = match[1];
    const url = match[2];
    const linkObject = { href: url, text: text, file: filePath };
    linksArray.push(linkObject);
}
  return linksArray;
}

// Con la URL que tenemos de parámetro, verificamos el status y ok.

const statusLink = (url) => {
  return new Promise((resolve, reject) => {
      const request = https.get(url, (result) => {
          const statusCode = result.statusCode;
          let message;
          result.statusCode >= 400 ? message = 'fail' : message = 'ok';
          resolve({ statusCode, message });
      });
      request.on('error', (err) => {
        if (err.code === "ENOTFOUND") {
          resolve({ statusCode: 404, message: 'fail' });
        } else {
          reject(err);
        }
      });
  })
}

const totalLinks = (linksArray) => {
  let linksCounter = 0;
    linksArray.map((statusLink) => {
      if(statusLink.href) {
          linksCounter++;
      }
  })
  return linksCounter;
}

const uniqueLinks = (linksArray) => {
  const uniqueLinksArray = [];
   linksArray.map((statusLink) => {
      if(!uniqueLinksArray.includes(statusLink.href)) {
          uniqueLinksArray.push(statusLink.href);
      }
  })
  return uniqueLinksArray.length;
}

const brokenLinks = (linksArray) => {
  let brokenLinksCounter = 0;
   linksArray.map((statusLink) => {
      if(statusLink.ok === 'fail') {
          brokenLinksCounter ++;
      }
  })
  return brokenLinksCounter;
}
const justStats = (linksArray) => {
  const total = totalLinks(linksArray);
  const unique = uniqueLinks(linksArray);

  return `Total: ${total} links,  Unique: ${unique} links`;
}

const statsWithValidate = (linksArray) => {
  const total = totalLinks(linksArray);
  const unique = uniqueLinks(linksArray);
  const broken = brokenLinks(linksArray);

  return `Total: ${total} links,  Unique: ${unique} links,  Broken: ${broken} links`;
}

module.exports = {
    pathIsAbsolute,
    routeIsValid,
    isMdFile,
    readFile,
    findLinks,
    statusLink,
    totalLinks,
    uniqueLinks,
    brokenLinks,
    justStats,
  statsWithValidate
};
