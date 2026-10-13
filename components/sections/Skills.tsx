import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import { skillGroups } from "@/data/skills";

export default function Skills() {
  return (
    <Section
      id="skills"
      title="Skills"
      description="Tools and methods I work with, grouped by area."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((group) => (
          <li key={group.category}>
            <Card className="h-full">
              <h3 className="font-display text-lg font-semibold">{group.category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}