import type { SkillGroup } from "./types";

// EDIT ME: grouped lists, no proficiency bars, so nothing overstates your level.
export const skillGroups: SkillGroup[] = [
  { category: "Programming", skills: ["Python", "C++", "JavaScript/TypeScript"] },
  {
    category: "Machine Learning",
    skills: ["scikit-learn", "Model evaluation", "Data preprocessing"],
  },
  { category: "Deep Learning", skills: ["PyTorch", "Neural networks", "CNNs"] },
  {
    category: "Engineering",
    skills: ["REST APIs", "Git", "Testing", "Integration development"],
  },
];