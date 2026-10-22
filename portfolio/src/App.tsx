import { MotionConfig } from "framer-motion";
import { sections } from "./data/resume";
import { useActiveSection } from "./hooks/useActiveSection";
import { StatusBar } from "./components/StatusBar";
import { Hero } from "./components/Hero";
import { DemoReel } from "./components/DemoReel";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { Education } from "./components/Education";
import { Certifications } from "./components/Certifications";
import { Contact } from "./components/Contact";
import { CommandPalette } from "./components/CommandPalette";
import { Shortcuts } from "./components/Shortcuts";
import { Starfield } from "./components/Starfield";
import { ThemeSwatches } from "./components/ThemeSwatches";
import { DocViewer } from "./components/DocViewer";
import { Games } from "./components/Games";
import { BootScreen } from "./components/BootScreen";
import { SoundToggle } from "./components/SoundToggle";

const ids = sections.map((s) => s.id);

export default function App() {
  const active = useActiveSection(ids);
  return (
    <MotionConfig reducedMotion="user">
      <BootScreen />
      <Starfield />
      <StatusBar active={active} />
      <CommandPalette />
      <DocViewer />
      <Games />
      <Shortcuts active={active} />
      <main id="main" className="relative z-10">
        <Hero />
        <DemoReel />
        <Projects />
        <Skills />
        <Experience />
        <Education />
        <Certifications />
        <Contact />
      </main>
      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 font-mono text-xs text-faint sm:px-8">
          <p>© {new Date().getFullYear()} Sujal Malhotra</p>
          <div className="flex items-center gap-4"><ThemeSwatches /><SoundToggle /></div>
          <p>built with React, TypeScript, Tailwind and Framer Motion</p>
        </div>
      </footer>
    </MotionConfig>
  );
}
