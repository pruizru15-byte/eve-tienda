import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { SettingsProvider } from "@/context/SettingsContext";
import CartDrawer from "@/components/CartDrawer";
import Chatbot from "@/components/Chatbot";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import UserTracker from "@/components/UserTracker";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import HelpPage from "./pages/HelpPage";
import ForumPage from "./pages/ForumPage";
import VerifyPage from "./pages/VerifyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminServices from './pages/admin/AdminServices';
import AdminOffers from './pages/admin/AdminOffers';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminHelp from './pages/admin/AdminHelp';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHeroSettings from './pages/admin/AdminHeroSettings';
import AdminBundles from './pages/admin/AdminBundles';
import AdminTemptingOffers from './pages/admin/AdminTemptingOffers';
import AdminFeaturedCategories from './pages/admin/AdminFeaturedCategories';
import AdminVanguard from './pages/admin/AdminVanguard';
import AdminContact from './pages/admin/AdminContact';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProfile from './pages/admin/AdminProfile';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <UserTracker />
            <CartDrawer />
            <Chatbot />
            <WhatsAppBubble />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/servicios" element={<ServicesPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/foro" element={<ForumPage />} />
              <Route path="/foro/:postId" element={<ForumPage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/stats" element={<AdminDashboard />} /> 
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/offers" element={<AdminOffers />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/help" element={<AdminHelp />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/hero-settings" element={<AdminHeroSettings />} />
              <Route path="/admin/bundles" element={<AdminBundles />} />
              <Route path="/admin/tempting-offers" element={<AdminTemptingOffers />} />
              <Route path="/admin/featured-categories" element={<AdminFeaturedCategories />} />
              <Route path="/admin/vanguard" element={<AdminVanguard />} />
              <Route path="/admin/contact-center" element={<AdminContact />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
