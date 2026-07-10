import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}