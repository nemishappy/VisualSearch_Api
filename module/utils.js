const fs = require('fs');
const path = require('path');
const {Op} = require('sequelize');
const getFolderSize = require('get-folder-size');
const dotEnv = require('dotenv');
dotEnv.config();


// Variables
const outputFolderPath = path.join(__dirname + '../../../' + 'output/');
const storageFilePathName = __dirname + '/../' + "/storage.txt";


/**
 * Check for minimum NodeJS requirement
 * @returns {boolean}
 * @constructor
 */
function ValidNodeJSVersion() {
  const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
  console.log('Current installed NodeJS version: ' + nodeVersion);
  return nodeVersion >= 10.17;
}

exports.ValidNodeJSVersion = ValidNodeJSVersion;

/**
 * Waiting function 
 * @param {Function} f
 * @param {int} timeoutMs
 * @return {Promise<any>}
 */
async function waitFor (f, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeWas = new Date();
    const wait = setInterval(function () {
      if (f()) {
        console.log("resolved after", new Date() - timeWas, "ms");
        clearInterval(wait);
        resolve();
      } else if (new Date() - timeWas > timeoutMs) {
        // Timeout
        console.log("rejected after", new Date() - timeWas, "ms");
        clearInterval(wait);
        reject();
      }
    }, 1000);
  });
};

exports.waitFor = waitFor;

/**
 * Read text file and return spilt text line by line
 * @param {fs.PathOrFileDescriptor} filename
 * @return {Array} 
 */
function syncReadFile(filename) {
  const contents = fs.readFileSync(filename, 'utf-8');

  const arr = contents.split(/\r?\n/);

  arr.pop()
  console.log(arr);

  return arr;
}

exports.syncReadFile = syncReadFile;

/**
 * Get product data from database

Find all match string (insensitive case)
and return product data included Promotion Product and Store name
 * @param {String} query
 * @param {Object} sequelizeObjects
 * @return {Promise<Array>}
 */
function searchProduct(query, sequelizeObjects) {
  return new Promise(function (resolve, reject) {
    const Sequelize = sequelizeObjects.sequelize;
    let lookupValue = query.toLowerCase();
    
    await sequelizeObjects.Product.findAll({
      limit: 10,
      where: {
        productName: Sequelize.where(Sequelize.fn('LOWER', Sequelize.fn('REPLACE', Sequelize.col('productName'), ' ', '')), 'LIKE', '%' + lookupValue + '%')
      },
      include: [sequelizeObjects.PromoProduct, { model: sequelizeObjects.Store, attributes: ['storeName'] }],
      order: [
        ['price', 'ASC']
      ]
    }).then(rows => {
      resolve(rows);
    }).catch(() => {
      resolve([]);
    });
  });
}

exports.searchProduct = searchProduct;

/**
 * Get store name by id
 * @param {int} id
 * @param {Object} sequelizeObjects
 * @return {Promise<Array>}
 */
async function getStoreName(id, sequelizeObjects) {
  const store = await sequelizeObjects.Store.findByPk(id, {
    attributes: ['id', 'storeName'],
  });
  if (store === null) {
    console.log("Not found!");
    return false;
  } else {
    return store;
  }
}

exports.getStoreName = getStoreName;

