import type { Profile } from "./types";

// EDIT ME: values in [square brackets] are placeholders.
// A value of null means "not available yet" and the site shows "Coming soon".
export const profile: Profile = {
  name: "Dev Gupta",
  brand: "Cosmic Intelligence Lab",
  role: "Data Science master's student",
  focusAreas: ["Machine Learning", "Deep Learning", "Applied AI"],
  heroHeadline: {
    first: "Building intelligent systems.",
    second: "Exploring how they learn.",
  },
  heroText:
    "I'm a Data Science master's student focused on machine learning, deep learning, and applied AI. I enjoy turning technical ideas into working systems and investigating how models behave.",
  about: {
    paragraphs: [
      "I'm a Data Science master's student specializing in machine learning and deep learning, with an engineering background and professional software development experience.",
      "I'm looking for ML Engineer, AI Engineer, and related technical roles, where I can turn ideas into working systems and investigate how models behave.",
      "[Placeholder] Add a sentence or two about your professional interests.",
    ],
    facts: [
      { label: "University", value: "[Your university]" },
      { label: "Degree", value: "[Your degree and expected graduation]" },
      { label: "Previous experience", value: "[Previous role / company]" },
      { label: "Education", value: "[Earlier education]" },
    ],
  },
  contact: {
    email: "guptadev.12034@gmail.com",
    github: "https://github.com/Alca1206",
    linkedin: "https://www.linkedin.com/in/devgupta1206/",
    // PDF lives in /public; the prefix keeps the link working on a GitHub Pages subfolder.
    resume: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Dev_Gupta_Resume.pdf`,
  },
};