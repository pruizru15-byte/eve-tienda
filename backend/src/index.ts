import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin/admin.routes.js';
import forumRoutes from './routes/forum.routes.js';
import helpRoutes from './routes/help.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import servicesRoutes from './routes/services.routes.js';
import productsPublicRoutes from './routes/products.public.routes.js';
import heroPublicRoutes from './routes/hero.public.routes.js';
import offersPublicRoutes from './routes/offers.public.routes.js';
import bundlesPublicRoutes from './routes/bundles.public.routes.js';
import temptingOffersPublicRoutes from './routes/tempting-offers.public.routes.js';
import categoriesPublicRoutes from './routes/categories.public.routes.js';
import locationRoutes from './routes/location.routes.js';
import ordersPublicRoutes from './routes/orders.public.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import * as featuredCategoriesPublicController from './controllers/featured-categories.public.controller.js';
import * as vanguardPublicController from './controllers/vanguard.public.controller.js';
import * as contactPublicController from './controllers/contact.public.controller.js';
import { submitContactForm } from './controllers/contact.controller.js';
import notificationRoutes from './routes/notifications.routes.js';
import { optionalAuthenticateToken } from './middlewares/auth.middleware.js';

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/public/services', servicesRoutes);
app.use('/api/public/products', productsPublicRoutes);
app.use('/api/public/hero-products', heroPublicRoutes);
app.use('/api/public/offers', offersPublicRoutes);
app.use('/api/public/bundles', bundlesPublicRoutes);
app.use('/api/tempting-offers', temptingOffersPublicRoutes);
app.use('/api/categories', categoriesPublicRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/public/orders', ordersPublicRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/featured-categories', featuredCategoriesPublicController.getActiveFeaturedCategories);
app.get('/api/vanguard', vanguardPublicController.getVanguardPublic);

// Rutas de Contacto
app.get('/api/contact-settings', contactPublicController.getContactSettingsPublic);
app.post('/api/contact', optionalAuthenticateToken as any, submitContactForm);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NovaTech API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
