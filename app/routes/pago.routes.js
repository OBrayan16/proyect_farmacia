module.exports = app => {
  const pagos = require("../controllers/pago.controller.js");
  var router = require("express").Router();

  router.post("/crear-sesion", pagos.createCheckout);
  router.get("/success", pagos.success);
  router.get("/cancel", pagos.cancel);

  app.use('/api/pagos', router);
};
