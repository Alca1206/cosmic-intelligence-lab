import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Research from "@/components/sections/Research";
import Skills from "@/components/sections/Skills";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

// The page is just the sections in order. Content lives in /data.
export default function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Research />
      <Skills />
      <About />
      <Contact />
    </>
  );
}