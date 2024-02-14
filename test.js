import fs from 'fs';
import mime from 'mime-types'

// Fonction pour vérifier si un fichier existe
const fileExists = async (filePath) => {
  try {
    // Utiliser fs.promises pour vérifier si le fichier existe
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true; // Le fichier existe
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // Le fichier n'existe pas
    } else {
      throw error; // Une erreur inattendue s'est produite
    }
  }
};

// Exemple d'utilisation
const filePath = '/tmp/files_manager/9ff8b1c1-55d0-4c2b-be48-2da7cf26b97d';
fileExists(filePath)
  .then((exists) => {
    console.log(`Le fichier ${filePath} ${exists ? 'existe.' : 'n\'existe pas.'}`);
  })
  .catch((error) => {
    console.error('Une erreur s\'est produite lors de la vérification du fichier:', error);
  });

const mity = mime.lookup('hello.txt')
console.log(mity)
