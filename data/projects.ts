import type { Project } from "./types";

// EDIT ME: add, remove, or reorder projects here. The page updates itself.
// Descriptions only state what each repository's README supports.
export const projects: Project[] = [
  {
    slug: "pneumonia-detection-cnn",
    title: "Pneumonia Detection from Chest X-rays",
    summary:
      "A custom PyTorch CNN that classifies chest X-ray images as pneumonia or normal, with class-imbalance handling, a threshold analysis trading sensitivity against specificity, Grad-CAM heatmaps, and a Streamlit app. For academic use only, not a medical device.",
    tags: ["PyTorch", "Python", "CNN", "Grad-CAM", "Streamlit"],
    repoUrl: "https://github.com/Alca1206/Pneumonia-Detection-using-CNN",
    detailPath: null,
    status: "complete",
    category: "Deep Learning",
  },
  {
    slug: "king-county-house-prices",
    title: "King County House Price Prediction",
    summary:
      "A full-stack price estimator: a PyTorch feedforward network trained on King County sales data, served through a FastAPI REST API with a Streamlit interface, and containerized with Docker Compose.",
    tags: ["PyTorch", "FastAPI", "Streamlit", "Docker", "Python"],
    repoUrl: "https://github.com/Alca1206/housing_price_prediction",
    detailPath: null,
    status: "complete",
    category: "Deep Learning",
  },
  {
    slug: "euro-energy-data-pipeline",
    title: "Euro Energy Data Pipeline",
    summary:
      "An Apache Airflow pipeline that ingests annual European energy generation and consumption data from the Eurostat API into PostgreSQL, with a Streamlit dashboard for year-by-year and country comparisons. Runs locally with Docker Compose.",
    tags: ["Apache Airflow", "PostgreSQL", "Docker", "Streamlit", "Python", "Eurostat API"],
    repoUrl: "https://github.com/Alca1206/Euro-Energy-Data-Pipeline",
    detailPath: null,
    status: "in-progress",
    category: "Data Engineering",
  },
  {
    slug: "handwritten-character-recognition",
    title: "Handwritten Character Recognition (EMNIST)",
    summary:
      "A PyTorch CNN trained on the EMNIST balanced dataset (47 classes of digits and letters), with an inference script that preprocesses raw input images before predicting.",
    tags: ["PyTorch", "Python", "CNN", "EMNIST"],
    repoUrl: "https://github.com/Alca1206/digit_alphabet_cnn",
    detailPath: null,
    status: "complete",
    category: "Deep Learning",
  },
  {
    slug: "job-agent",
    title: "Job Agent",
    summary:
      "A tool that compares a job description with your CV using an LLM run through Ollama (Llama 3.1 8B) and generates a Markdown report: match score, skill gaps, a tailored cover letter, and interview tips. FastAPI backend with a Streamlit interface.",
    tags: ["Python", "FastAPI", "Streamlit", "Ollama", "LLM", "Docker"],
    repoUrl: "https://github.com/Alca1206/Job-Agent",
    detailPath: null,
    status: "in-progress",
    category: "LLM Apps",
  },
];