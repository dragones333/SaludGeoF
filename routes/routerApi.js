const express = require('express');
const authRouter = require('./authRoutes');
const locationRouter = require('./locationRoutes');
const zoneRouter = require('./zoneRoutes');
const staffRouter = require('./staffRoutes');

const { checkJwt } = require('../middlewares/authHandler');

function routerApi(app) {
  const router = express.Router();
  app.use('/api', router);

  router.use('/auth', authRouter);

  router.use('/locations', checkJwt, locationRouter);
  router.use('/zones', checkJwt, zoneRouter);
  router.use('/staff', checkJwt, staffRouter);
}

module.exports = routerApi;