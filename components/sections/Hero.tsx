import { ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import ConstellationMap from "@/components/constellation/ConstellationMap";
import { constellationCenter, constellationNodes } from "@/data/constellation";
import { profile } from "@/data/profile";

export default function Hero() {
  const { heroHeadline, heroText, focusAreas, contact } = profile;

  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100svh-4rem)] items-center"
    >
      {/* Two columns on large screens (text | map); stacked on phones and tablets */}
            <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-10 lg:py-8">
        <div>
          <h1 className="max-w-4xl text-display font-semibold lg:text-[3.25rem] xl:text-[3.75rem]">
            <span className="block">{heroHeadline.first}</span>
            <span className="block text-violet">{heroHeadline.second}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">{heroText}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="#projects">Explore My Work</Button>
            <Button href={contact.resume} variant="secondary">
              View Résumé
            </Button>
          </div>

          <ul
            aria-label="Focus areas"
            className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted"
          >
            {focusAreas.map((area, index) => (
              <li key={area} className="flex items-center gap-3">
                {index > 0 && <span aria-hidden="true">·</span>}
                {area}
              </li>
            ))}
          </ul>
        </div>

        <ConstellationMap center={constellationCenter} nodes={constellationNodes} />
      </div>

      {/* Only shown on large screens that are also tall enough to leave room for it */}
      <div className="container-page absolute inset-x-0 bottom-6 hidden [@media(min-width:1024px)_and_(min-height:721px)]:block">
        <a
          href="#projects"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronDown size={18} aria-hidden="true" className="animate-nudge" />
          Scroll to projects
        </a>
      </div>
    </section>
  );
}