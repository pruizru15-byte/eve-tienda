import type { Response } from 'express';
import prisma from '../../lib/prisma.js';
import { sendOrderConfirmationEmail } from '../../lib/email.js';

export const getOrders = async (req: any, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

export const completeOrder = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({ 
        where: { id },
        include: { user: true }
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.status !== 'PENDING') return res.status(400).json({ error: 'La orden ya no está pendiente' });

    const items = JSON.parse(order.items);

    // Actualizar inventario para cada producto
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Marcar orden como COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    // Actualizar total_spent del usuario
    await prisma.user.update({
      where: { id: order.user_id },
      data: {
        total_spent: {
          increment: order.total
        }
      }
    });

    // Crear notificación interna para el cliente
    await prisma.notification.create({
      data: {
        user_id: order.user_id,
        title: '¡Venta Confirmada!',
        message: `Tu pedido #${order.id.split('-')[0].toUpperCase()} por un total de $${order.total.toLocaleString()} ha sido procesado con éxito. ¡Gracias por confiar en NovaTech!`,
        type: 'success'
      }
    });

    // Enviar correo de confirmación
    try {
        await sendOrderConfirmationEmail(order.user.email, order);
    } catch (mailError) {
        console.error('Error al enviar correo de confirmación:', mailError);
        // No bloqueamos la respuesta si falla el correo
    }

    res.json({ message: 'Venta realizada con éxito y correo enviado', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al completar la venta' });
  }
};

export const cancelOrder = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    res.json({ message: 'Orden anulada', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Error al anular la orden' });
  }
};
