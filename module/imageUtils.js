'use strict';
const fs = require('fs');

/**
 * Loads images from given file path for given images array...
 * @param filePath image root where to load images from
 * @param images containing image detail objects without image data
 * @return {Promise<*[]>}
 * @constructor
 */
async function LoadImages(filePath = null, images = []) {
  console.log("------------filepath from LoadImage in imageUtils-------------",filePath);
  if (filePath === null) {
    console.log("------------if loaded image function hello-------------");
    return [];
  }
  for (const image of images) {
    console.log("------------for in LoadImage in image utils-------------");
    image.image = await loadImage(filePath, image.file_name);
  }
  return images;
}

exports.LoadImages = LoadImages;


/**
 * Loads one image file data
 * @param filePath image root where to load images from
 * @param fileName name of wanted image data file
 * @return {Promise<string>}
 */
async function loadImage(filePath, fileName) {
  return new Promise(resolve => {
    fs.readFile(filePath + fileName, function (error, data) {
      if (!error) {
        resolve('data:image/png;base64,' + Buffer.from(data).toString('base64'));
        {console.log("Not err",filePath + fileName)}
      } else {
        resolve(null);
        {console.log("err",error)}
      }
    });
  });
}
