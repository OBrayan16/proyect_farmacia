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
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Verificamos la firma criptográfica (Stripe usa la variable de entorno aquí)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Error de seguridad del Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Si la verificación es exitosa y el evento es un pago completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // 3. Buscamos esa transacción específica en tu base de datos
      const transaccion = await TransaccionPago.findOne({ 
        where: { id_transaccion_stripe: session.id } 
      });

      if (transaccion) {
        // 4. ¡Magia! Cambiamos el estado de 'Pendiente' a 'Pagado'
        transaccion.estado_pago = 'Pagado';
        await transaccion.save();
        console.log(`✅ ¡Éxito! Transacción ${session.id} actualizada a Pagado automáticamente.`);
      }
    } catch (error) {
      console.error("❌ Error actualizando la base de datos:", error);
    }
  }

  // 5. Siempre debemos responderle a Stripe con un 200 OK para que sepa que lo recibimos
  res.json({ recibido: true });
};