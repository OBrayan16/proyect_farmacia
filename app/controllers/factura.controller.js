const db = require("../models");
const Factura = db.facturas;
const DetalleFactura = db.detalle_facturas;
const Producto = db.productos;
const sequelize = db.sequelize; // Importante: Necesitamos esto para usar Transacciones

// 1. Crear una Factura (con Detalles y descuento de Stock)
exports.create = async (req, res) => {
  // Verificamos que vengan los datos principales y la lista de productos (detalles)
  if (!req.body.id_cliente || !req.body.detalles || req.body.detalles.length === 0) {
    return res.status(400).send({ message: "Faltan datos del cliente o no hay productos en la factura." });
  }

  // Iniciamos la transacción
  const t = await sequelize.transaction();

  try {
    // A. Guardamos el Encabezado de la Factura
    const factura = await Factura.create({
      numero_factura: req.body.numero_factura,
      id_cliente: req.body.id_cliente,
      id_empleado: req.body.id_empleado,
      subtotal: req.body.subtotal,
      impuesto: req.body.impuesto,
      total: req.body.total,
      metodo_pago: req.body.metodo_pago,
      estado_factura: req.body.estado_factura || "Completada"
    }, { transaction: t });

    // B. Recorremos la lista de productos vendidos (detalles)
    const detalles = req.body.detalles;
    
    for (let i = 0; i < detalles.length; i++) {
      const item = detalles[i];

      // 1. Buscar el producto en la base de datos
      const producto = await Producto.findByPk(item.id_producto, { transaction: t });

      // 2. Validar que exista y que haya suficiente stock
      if (!producto) {
        throw new Error(`El producto con ID ${item.id_producto} no existe.`);
      }
      if (producto.stock_actual < item.cantidad) {
        throw new Error(`Stock insuficiente para '${producto.nombre}'. Solicitado: ${item.cantidad}, Disponible: ${producto.stock_actual}`);
      }

      // 3. Descontar el stock actual
      await producto.update({
        stock_actual: producto.stock_actual - item.cantidad
      }, { transaction: t });

      // 4. Guardar el detalle de la factura
      await DetalleFactura.create({
        id_factura: factura.id_factura,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal_linea: item.cantidad * item.precio_unitario
      }, { transaction: t });
    }

    // C. Si todo salió perfecto, confirmamos (commit) la transacción
    await t.commit();
    
    // Respondemos con éxito
    res.status(201).send({ 
        message: "Factura procesada con éxito y stock actualizado.", 
        id_factura: factura.id_factura 
    });

  } catch (error) {
    // D. Si hubo CUALQUIER error, deshacemos todos los cambios (rollback)
    await t.rollback();
    res.status(500).send({ 
        message: "Error al procesar la factura. La transacción fue cancelada.", 
        detalle: error.message 
    });
  }
};

// 2. Obtener todas las Facturas (Incluyendo sus detalles)
exports.findAll = (req, res) => {
  Factura.findAll({
    include: [
      {
        model: db.clientes,
        attributes: ['nombre', 'apellido', 'nit'] // Trae datos del cliente
      }
    ]
  })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// 3. Obtener una Factura específica con todo su desglose
exports.findOne = (req, res) => {
  const id = req.params.id;

  Factura.findByPk(id, {
    include: [
      { model: db.clientes, attributes: ['nombre', 'apellido', 'nit'] },
      { model: db.empleados, attributes: ['nombre', 'puesto'] },
      { 
        model: db.detalle_facturas, 
        include: [{ model: db.productos, attributes: ['nombre'] }] // Trae el nombre del producto vendido
      }
    ]
  })
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: `No se encontró la Factura con id=${id}.` });
    })
    .catch(err => res.status(500).send({ message: "Error al recuperar la Factura." }));
};
