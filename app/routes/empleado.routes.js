module.exports = app => {
  const empleados = require("../controllers/empleado.controller.js");
  var router = require("express").Router();

  router.post("/", empleados.create);
  router.get("/", empleados.findAll);
  router.get("/activos/lista", empleados.findAllStatus);
  router.get("/:id", empleados.findOne);
  router.put("/:id", empleados.update);
  router.delete("/:id", empleados.delete);
  router.delete("/", empleados.deleteAll);

  app.use('/api/empleados', router);
};
