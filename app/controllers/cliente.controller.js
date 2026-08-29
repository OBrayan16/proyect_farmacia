const db = require("../models");
const Cliente = db.clientes;

// 1. Crear y guardar un nuevo Cliente
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.nit) {
    res.status(400).send({ message: "El contenido no puede estar vacío (nit y nombre son obligatorios)." });
    return;
  }

  const cliente = {
    nit: req.body.nit,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    email: req.body.email,
    direccion: req.body.direccion,
    estado: req.body.estado ? req.body.estado : true
  };

  Cliente.create(cliente)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al crear el Cliente." }));
};

// 2. Obtener todos los Clientes
exports.findAll = (req, res) => {
  Cliente.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al recuperar los clientes." }));
};

// 3. Encontrar un Cliente por su ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Cliente.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró el Cliente con id_cliente=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: "Error al recuperar el Cliente con id_cliente=" + id }));
};

// 4. Actualizar un Cliente por su ID
exports.update = (req, res) => {
  const id = req.params.id;

  Cliente.update(req.body, { where: { id_cliente: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "El Cliente fue actualizado exitosamente." });
      } else {
        res.send({ message: `No se pudo actualizar el Cliente con id=${id}. Tal vez el Cliente no fue encontrado o req.body está vacío.` });
      }
    })
    .catch(err => res.status(500).send({ message: "Error al actualizar el Cliente con id=" + id }));
};

// 5. Eliminar un Cliente por su ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Cliente.destroy({ where: { id_cliente: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "El Cliente fue eliminado exitosamente." });
      } else {
        res.send({ message: `No se pudo eliminar el Cliente con id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: "No se pudo eliminar el Cliente con id=" + id }));
};

// 6. Eliminar todos los Clientes (Cuidado con este método en producción)
exports.deleteAll = (req, res) => {
  Cliente.destroy({ where: {}, truncate: false })
    .then(nums => res.send({ message: `${nums} Clientes fueron eliminados exitosamente.` }))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al eliminar a todos los clientes." }));
};

// 7. Encontrar todos los Clientes Activos (findAllStatus)
exports.findAllStatus = (req, res) => {
  Cliente.findAll({ where: { estado: true } })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Ocurrió un error al recuperar los clientes activos." }));
};
