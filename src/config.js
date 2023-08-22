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
  const linksInFile = [];
  const linksRegExp = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(((?:https?|ftp|file|http):\/\/[^\)]+)\))/gi;

  const matches = content.matchAll(linksRegExp);
for (const match of matches) {
    const linkText = match[1];
    const linkUrl = match[2];
    const link = { href: linkUrl, text: linkText, file: filePath };
    linksInFile.push(link);
}
  return linksInFile;
}

// Con la URL que tenemos de parámetro, verificamos el status y ok.

const statusLink = (url) => {
  return new Promise((resolve, reject) => {
      const request = https.get(url, (res) => {
          const statusCode = res.statusCode;
          let message;
          res.statusCode >= 400 ? message = 'fail' : message = 'ok';
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

const totalLinks = (statsLinksArray) => {
  let linksCounter = 0;
  statsLinksArray.map((statusLink) => {
      if(statusLink.href) {
          linksCounter++;
      }
  })
  return linksCounter;
}

const uniqueLinks = (statsLinksArray) => {
  const uniqueLinksArray = [];
  statsLinksArray.map((statusLink) => {
      if(!uniqueLinksArray.includes(statusLink.href)) {
          uniqueLinksArray.push(statusLink.href);
      }
  })
  return uniqueLinksArray.length;
}

const brokenLinks = (statsLinksArray) => {
  let brokenCounter = 0;
  statsLinksArray.map((statusLink) => {
      if(statusLink.ok === 'fail') {
          brokenCounter ++;
      }
  })
  return brokenCounter;
}
const simpleStats = (statsLinksArray) => {
  const total = totalLinks(statsLinksArray);
  const unique = uniqueLinks(statsLinksArray);

  return `Total: ${total},  Unique: ${unique}`;
}

const statsValidate = (statsLinksArray) => {
  const total = totalLinks(statsLinksArray);
  const unique = uniqueLinks(statsLinksArray);
  const broken = brokenLinks(statsLinksArray);

  return `Total: ${total},  Unique: ${unique},  Broken: ${broken}`;
}

module.exports = {
    pathIsAbsolute,
    routeIsValid,
    isMdFile,
    readFile,
    findLinks,
    statusLink,
    simpleStats,
  statsValidate
};
