module.exports = (sequelize, Sequelize) => {
  const Empleado = sequelize.define("empleado", {
    id_empleado: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    codigo_empleado: { type: Sequelize.STRING(20) },
    nombre: { type: Sequelize.STRING(100) },
    apellido: { type: Sequelize.STRING(100) },
    puesto: { type: Sequelize.STRING(50) },
    telefono: { type: Sequelize.STRING(20) },
    email: { type: Sequelize.STRING(150) },
    estado: { type: Sequelize.BOOLEAN, defaultValue: true },
    fecha_ingreso: { type: Sequelize.DATE }
  }, { timestamps: false });
  return Empleado;
};
