// Importamos stripe y le pasamos tu clave secreta de entorno
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const TransaccionPago = db.transacciones_pago;

exports.createCheckout = async (req, res) => {
  try {
    const { id_factura, total, email_cliente } = req.body;

    // 1. Generar la sesión de cobro segura en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email_cliente,
      line_items: [{
        price_data: {
          currency: 'gtq', // Quetzales (puedes cambiarlo a 'usd')
          product_data: {
            name: `Pago de Factura #${id_factura}`,
            description: 'Compra en Farmacia',
          },
          unit_amount: Math.round(total * 100), // Stripe maneja todo en centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      // URLs a donde Stripe enviará al usuario tras pagar (o cancelar)
      success_url: 'https://proyect-farmacia.onrender.com/api/pagos/success',
      cancel_url: 'https://proyect-farmacia.onrender.com/api/pagos/cancel',
    });

    // 2. Guardar el registro en la tabla transacciones_pago
    await TransaccionPago.create({
      id_factura: id_factura,
      id_transaccion_stripe: session.id,
      monto: total,
      metodo_pago: 'Tarjeta',
      estado_pago: 'Pendiente'
    });

    // 3. Devolver la URL de la pasarela al frontend
    res.status(200).json({ url: session.url });

  } catch (error) {
    res.status(500).send({ message: "Error con Stripe: " + error.message });
  }
};

// Métodos de respuesta simples para las redirecciones
exports.success = (req, res) => res.send("¡Pago completado con éxito!");
exports.cancel = (req, res) => res.send("El pago fue cancelado.");