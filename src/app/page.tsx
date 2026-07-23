import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import WhyUs from "@/components/WhyUs";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <MenuSection />
        <WhyUs />
        <LocationSection />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloatingButton />
    </>
  );
}
