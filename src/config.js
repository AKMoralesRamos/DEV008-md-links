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

const isMdFileOrDirectory = (route) => {
  try {
    const stats = fs.statSync(route);
    if (stats.isDirectory()) {
      return true;
    } else if (path.extname(route) === ".md") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

/* const isMdFile = (route) => {
  const mdFile = path.extname(route);
  if (mdFile !== ".md") {
    throw new Error('No se encontraron archivos .md');
  } else {
    return true;
  }
}; */

// Si el archivo es .md o directorio haremos la lectura y retornamos la data como string

const readFileOrDirectory = (route) => {
  let arrayFiles = [];

  const stats = fs.statSync(route);

  if (stats.isFile() && path.extname(route) === '.md') {
    arrayFiles.push(route);
  } else if (stats.isDirectory()) {
    const files = fs.readdirSync(route, 'utf-8');
    files.forEach((file) => {
      const newRoute = path.join(route, file);
      const statsNew = fs.statSync(newRoute);

      if (statsNew.isFile() && path.extname(newRoute) === '.md') {
        arrayFiles.push(newRoute);
      } else if (statsNew.isDirectory()) {
        arrayFiles = arrayFiles.concat(readFileOrDirectory(newRoute));
      }
    });
  }

  return arrayFiles;

};


/* const readFiles = (route) => {
  return new Promise((resolve, reject) => {
    fs.readFile(route, (err, data) => {
      if (err) {
        reject('No se puede leer el archivo');
      } else {
        resolve(data.toString());
      }
    });
  });
} */


const readFiles = (arrayFiles) => {
  const newFiles = arrayFiles.map((file) => {
    const absolutePath = path.resolve(file); // Obtener la ruta absoluta del archivo
    return new Promise((resolve, reject) => {
      fs.readFile(absolutePath, 'utf-8', (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve({ path: absolutePath, data: data }); // Devolver la ruta y los datos leídos
        }
      });
    });
  });
console.log (Promise.all(newFiles));
  return Promise.all(newFiles);
};


// Ahora con la lectura del archivo, buscaremos el texto y link en base a
// una expresión regular.

const findLinks = (content) => {
  const linksArray = [];
  const RegExpFindLinks = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(((?:https?|ftp|file|http):\/\/[^\)]+)\))/gi;

  content.forEach(contentObj => {
    const matches = contentObj.data.matchAll(RegExpFindLinks);
    for (const match of matches) {
      const text = match[1];
      const url = match[2];
      const linkObject = { href: url, text: text, file: contentObj.path };
      linksArray.push(linkObject);
    }
  });

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
    isMdFileOrDirectory,
    readFileOrDirectory,
    readFiles,
    findLinks,
    statusLink,
    totalLinks,
    uniqueLinks,
    brokenLinks,
    justStats,
  statsWithValidate
};
