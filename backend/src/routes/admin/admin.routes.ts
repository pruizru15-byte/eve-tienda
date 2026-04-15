import { Router } from 'express';
import { getDashboardStats } from '../../controllers/admin/admin.controller.js';
import * as productsController from '../../controllers/admin/products.controller.js';
import * as categoriesController from '../../controllers/admin/categories.controller.js';
import * as promotionsController from '../../controllers/admin/promotions.controller.js';
import * as servicesController from '../../controllers/admin/services.controller.js';
import * as offersController from '../../controllers/admin/offers.controller.js';
import * as usersController from '../../controllers/admin/users.controller.js';
import * as messagesController from '../../controllers/admin/messages.controller.js';
import * as helpController from '../../controllers/help.controller.js';
import * as bundlesController from '../../controllers/admin/bundles.controller.js';
import * as temptingOffersController from '../../controllers/admin/tempting-offers.controller.js';
import * as featuredCategoriesController from '../../controllers/admin/featured-categories.controller.js';
import * as vanguardController from '../../controllers/admin/vanguard.controller.js';
import * as contactController from '../../controllers/admin/contact.controller.js';
import * as ordersAdminController from '../../controllers/admin/orders.admin.controller.js';
import { authenticateToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { upload } from '../../lib/upload.js';

const router = Router();

// Todas las rutas de admin deben estar protegidas
router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', getDashboardStats);

// Rutas de mensajes e inbox
router.get('/messages/inbox', messagesController.getInboxMessages);
router.put('/messages/inbox/:id', messagesController.updateInboxMessageStatus);
router.post('/messages/inbox/:id/reply', messagesController.replyToInboxMessage);
router.get('/messages/forum', messagesController.getForumTopics);
router.post('/messages/forum', messagesController.createForumAnnouncement);
router.post('/messages/reactions', messagesController.toggleReaction);

// Rutas de usuarios y monitoreo
router.get('/users', usersController.getUsers);
router.get('/users/stats', usersController.getUserStats);
router.get('/users/:id', usersController.getUserDetails);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);

// Rutas de subir imágenes...
router.post('/upload', upload.single('image'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const url = `http://localhost:3000/public/uploads/${req.file.filename}`;
  res.json({ url });
});

import * as heroController from '../../controllers/hero.controller.js';
// Rutas de Hero Settings
router.get('/hero/settings', heroController.getHeroSettings);
router.patch('/hero/mode', heroController.updateHeroMode);
router.patch('/products/:id/hero-carousel', heroController.toggleProductHeroCarousel);

// Rutas de productos
router.get('/products', productsController.getProducts);
router.post('/products', productsController.createProduct);
router.put('/products/:id', productsController.updateProduct);
router.delete('/products/:id', productsController.deleteProduct);

// Rutas de categorías
router.get('/categories', categoriesController.getCategories);
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deactivateCategory);
router.patch('/categories/:id/status', categoriesController.toggleCategoryStatus);

// Rutas de promociones
router.get('/promotions', promotionsController.getPromotions);
router.get('/promotions/stats', promotionsController.getPromotionStats);
router.post('/promotions', promotionsController.createPromotion);
router.put('/promotions/:id', promotionsController.updatePromotion);
router.delete('/promotions/:id', promotionsController.deletePromotion);

// Rutas de servicios
router.get('/services/categories', servicesController.getServiceCategories);
router.patch('/services/categories/:id/status', servicesController.toggleServiceCategoryStatus);
router.post('/services/categories', servicesController.createServiceCategory);
router.get('/services', servicesController.getServices);
router.post('/services', servicesController.createService);
router.put('/services/:id', servicesController.updateService);
router.delete('/services/:id', servicesController.deactivateService);
router.patch('/services/:id/status', servicesController.toggleServiceStatus);

// Rutas de ofertas
router.get('/offers', offersController.getOffers);
router.post('/offers', offersController.createOffer);
router.put('/offers/:id', offersController.updateOffer);
router.delete('/offers/:id', offersController.deleteOffer);

// Rutas del centro de ayuda / términos
router.get('/help', helpController.getAllHelpSections);
router.post('/help', helpController.createHelpSection);
router.put('/help/:id', helpController.updateHelpSection);
router.delete('/help/:id', helpController.deleteHelpSection);

// Rutas de bundles
router.get('/bundles', bundlesController.getAllBundles);
router.post('/bundles', bundlesController.createBundle);
router.put('/bundles/:id', bundlesController.updateBundle);
router.delete('/bundles/:id', bundlesController.deleteBundle);

// Rutas de ofertas tentadoras
router.get('/tempting-offers', temptingOffersController.getTemptingOffers);
router.post('/tempting-offers', temptingOffersController.createTemptingOffer);
router.put('/tempting-offers/:id', temptingOffersController.updateTemptingOffer);
router.delete('/tempting-offers/:id', temptingOffersController.deleteTemptingOffer);

// Rutas de categorías destacadas (Category Showcase)
router.get('/featured-categories', featuredCategoriesController.getFeaturedCategories);
router.post('/featured-categories', featuredCategoriesController.createFeaturedCategory);
router.put('/featured-categories/:id', featuredCategoriesController.updateFeaturedCategory);
router.delete('/featured-categories/:id', featuredCategoriesController.deleteFeaturedCategory);
router.patch('/featured-categories/reorder', featuredCategoriesController.reorderFeaturedCategories);

// Rutas de Módulo Vanguardia (Sobre Nosotros)
router.get('/vanguard', vanguardController.getVanguard);
router.put('/vanguard', vanguardController.updateVanguard);

// Rutas de Contacto (Centro de Contacto)
router.get('/contact-settings', contactController.getContactSettings);
router.put('/contact-settings', contactController.updateContactSettings);
router.get('/messages', contactController.getMessages);
router.patch('/messages/:id/read', contactController.markAsRead);
router.post('/messages/:id/reply', contactController.replyToMessage);

// Rutas de Pedidos (Ventas)
router.get('/orders', ordersAdminController.getOrders);
router.patch('/orders/:id/complete', ordersAdminController.completeOrder);
router.patch('/orders/:id/cancel', ordersAdminController.cancelOrder);

export default router;
