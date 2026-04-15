import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import FeaturedProducts from "@/components/FeaturedProducts";
import DealsSection from "@/components/DealsSection";
import BestSellersLaptops from "@/components/BestSellersLaptops";
import TestimonialsSection from "@/components/TestimonialsSection";
import BundleSection from "@/components/BundleSection";
import TemptationsSection from "@/components/TemptationsSection";
import CategoriesGrid from "@/components/CategoriesGrid";
import CategoryShowcase from "@/components/CategoryShowcase";
import ForumSection from "@/components/ForumSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <HeroBanner />
      <FeaturedProducts />
      <DealsSection />
      <BestSellersLaptops />
      <TestimonialsSection />
      <BundleSection />
      <TemptationsSection />
      <CategoryShowcase />
      <ForumSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
