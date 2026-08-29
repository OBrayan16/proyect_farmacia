const db = require("../models");
const Empleado = db.empleados;

// 1. Crear y guardar un nuevo Empleado
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.codigo_empleado) {
    res.status(400).send({ message: "El código de empleado y el nombre son obligatorios." });
    return;
  }

  const empleado = {
    codigo_empleado: req.body.codigo_empleado,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    puesto: req.body.puesto,
    telefono: req.body.telefono,
    email: req.body.email,
    estado: req.body.estado !== undefined ? req.body.estado : true,
    fecha_ingreso: req.body.fecha_ingreso
  };

  Empleado.create(empleado)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al crear el Empleado." }));
};

// 2. Obtener todos los Empleados
exports.findAll = (req, res) => {
  Empleado.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al recuperar los empleados." }));
};

// 3. Encontrar un Empleado por su ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Empleado.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró el Empleado con id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: "Error al recuperar el Empleado con id=" + id }));
};

// 4. Actualizar un Empleado por su ID
exports.update = (req, res) => {
  const id = req.params.id;

  Empleado.update(req.body, { where: { id_empleado: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "El Empleado fue actualizado exitosamente." });
      } else {
        res.send({ message: `No se pudo actualizar el Empleado con id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: "Error al actualizar el Empleado." }));
};

// 5. Eliminar un Empleado por su ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Empleado.destroy({ where: { id_empleado: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "El Empleado fue eliminado exitosamente." });
      } else {
        res.send({ message: `No se pudo eliminar el Empleado con id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: "No se pudo eliminar el Empleado." }));
};

// 6. Eliminar todos los Empleados
exports.deleteAll = (req, res) => {
  Empleado.destroy({ where: {}, truncate: false })
    .then(nums => res.send({ message: `${nums} Empleados fueron eliminados exitosamente.` }))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al eliminar a todos los empleados." }));
};

// 7. Encontrar todos los Empleados Activos
exports.findAllStatus = (req, res) => {
  Empleado.findAll({ where: { estado: true } })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al recuperar los empleados activos." }));
};
