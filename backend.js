// NOTE: This task can have multiple instances, pm2 start intelligence.js -i 2
"use strict";

// Components
const logger = require("./module/logger");
const utils = require("./module/utils");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const dotEnv = require("dotenv");
dotEnv.config();
const path = require("path");
const helmet = require("helmet");
const initDb = require("./module/database");

if (!utils.ValidNodeJSVersion()) {
  console.error(
    "# WARNING, NODEJS VERSION DOES NOT MEET MINIMUM REQUIREMENT #"
  );
  process.exit(0);
}

// Run app
initDb.initDatabase().then(async () => {
  let sequelizeObjects = require("./module/sequelize");

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    })
  );

  if (process.env.ALLOW_ACCESS_ORIGIN_ALL === "true") {
    // ALLOW_ACCESS_ORIGIN_ALL will let any origin client connect to this api
    app.use(function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, DELETE, PATCH, PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
      );
      next();
    });
  } else {
    // helps you secure your Express apps by setting various HTTP headers
    app.use(helmet());
  }

  app.use(function (req, res, next) {
    logger.log(req.method + req.url, logger.LOG_UNDERSCORE);
    next();
  });

  // -------------------------------------------------------------------------------------------------------------------
  // Register routes

  require("./routes/testdir").TestAPI(app, sequelizeObjects);
  require("./routes/stores").Stores(app, sequelizeObjects);
  require("./routes/products").Products(app, sequelizeObjects);

  // -------------------------------------------------------------------------------------------------------------------
  // Serve web front end (serve as last after api routes)

  // app.use('/', express.static(path.join(__dirname, '/html/')));
  // app.get('*', function (req, res) {
  //   res.sendFile('index.html', { root: path.join(__dirname, '/html/') });
  // });

  // -------------------------------------------------------------------------------------------------------------------
  // Start web server

  // Development server
  app.listen(process.env.API_PORT, () => {
    logger.log(
      `Development api listening on port ${process.env.API_PORT}.`,
      logger.LOG_YELLOW
    );
  });
});
