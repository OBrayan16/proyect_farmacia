module.exports = app => {
  const facturas = require("../controllers/factura.controller.js");
  var router = require("express").Router();

  router.post("/", facturas.create);
  router.get("/", facturas.findAll);
  router.get("/:id", facturas.findOne);

  app.use('/api/facturas', router);
};
