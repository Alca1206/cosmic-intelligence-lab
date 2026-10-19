import type { Project } from "./types";

// ============================================================================
// ADDING A PROJECT: copy the template below, paste it at the END of the list, fill
// it in, and save. The card, the star on the map, the page and the sitemap all
// appear by themselves. Nothing else needs to change.
//
// Rules (a test checks them, so a mistake is caught before you publish):
//   - Only state what the repository's README supports. No guesses, no made-up links.
//   - slug: lowercase words joined by dashes, and different from every other slug.
//   - category: one of the names in data/categories.ts (add a line there for a new one).
//   - status: "complete", "in-progress" or "placeholder" (say honestly where it stands).
//   - repoUrl: the GitHub link, or null if there is none yet. Never invent one.
//   - detail: optional. Add it to give the project its own page; leave it out for a
//     card that simply links to GitHub.
//
// TEMPLATE
//   {
//     slug: "my-project",
//     title: "My Project",
//     summary: "One or two sentences on what it is and what it does.",
//     tags: ["Python", "PyTorch"],
//     repoUrl: "https://github.com/Alca1206/my-project",
//     status: "in-progress",
//     category: "Deep Learning",
//     detail: {
//       overview: "One or two sentences for the top of the page.",
//       highlights: ["What it does, one short line each."],
//       notes: ["Honest limits, e.g. results coming soon."],
//     },
//   },
// ============================================================================
export const projects: Project[] = [
  {
    slug: "pneumonia-detection-cnn",
    title: "Pneumonia Detection from Chest X-rays",
    summary:
      "A custom PyTorch CNN that classifies chest X-ray images as pneumonia or normal, with class-imbalance handling, a threshold analysis trading sensitivity against specificity, Grad-CAM heatmaps, and a Streamlit app. For academic use only, not a medical device.",
    tags: ["PyTorch", "Python", "CNN", "Grad-CAM", "Streamlit"],
    repoUrl: "https://github.com/Alca1206/Pneumonia-Detection-using-CNN",
    status: "complete",
    category: "Deep Learning",
    detail: {
      overview:
        "Binary classification of chest X-ray images (pneumonia or normal) with a custom CNN in PyTorch, trained on the public Kaggle Chest X-Ray Images (Pneumonia) dataset.",
      highlights: [
        "Custom three-block CNN with batch normalization and dropout, followed by a regularized classifier head.",
        "Weighted loss (BCEWithLogitsLoss with a positive-class weight) to handle the class imbalance of roughly 2.9 pneumonia images per normal image.",
        "Rebuilt the validation split from the training set (stratified 80/20), because the dataset's original validation split has only 16 images.",
        "Threshold analysis showing how sensitivity and specificity trade off at different decision thresholds.",
        "Streamlit app with Grad-CAM heatmaps and an adjustable decision threshold.",
      ],
      notes: [
        "For academic and research use only. This is not a medical device and must not be used for diagnosis.",
        "Detailed evaluation results are coming soon.",
      ],
    },
  },
  {
    slug: "king-county-house-prices",
    title: "King County House Price Prediction",
    summary:
      "A full-stack price estimator: a PyTorch feedforward network trained on King County sales data, served through a FastAPI REST API with a Streamlit interface, and containerized with Docker Compose.",
    tags: ["PyTorch", "FastAPI", "Streamlit", "Docker", "Python"],
    repoUrl: "https://github.com/Alca1206/housing_price_prediction",
    status: "complete",
    category: "Deep Learning",
    detail: {
      overview:
        "A full-stack application that estimates King County house prices from property features.",
      highlights: [
        "Feedforward neural network in PyTorch, trained on the public King County house sales dataset (about 21,600 records).",
        "Model weights, feature scaler, and column order bundled into one package, so inference preprocessing matches training.",
        "FastAPI REST backend with interactive API documentation.",
        "Streamlit front end for entering a house's details and getting an estimate.",
        "Docker Compose runs the backend and front end together.",
      ],
      notes: [
        "Error metrics (such as RMSE) are coming soon.",
      ],
    },
  },
  {
    slug: "euro-energy-data-pipeline",
    title: "Euro Energy Data Pipeline",
    summary:
      "An Apache Airflow pipeline that ingests annual European energy generation and consumption data from the Eurostat API into PostgreSQL, with a Streamlit dashboard for year-by-year and country comparisons. Runs locally with Docker Compose.",
    tags: ["Apache Airflow", "PostgreSQL", "Docker", "Streamlit", "Python", "Eurostat API"],
    repoUrl: "https://github.com/Alca1206/Euro-Energy-Data-Pipeline",
    status: "in-progress",
    category: "Data Engineering",
    detail: {
      overview:
        "A data pipeline that collects annual European energy generation and consumption data and presents it in an interactive dashboard.",
      highlights: [
        "Apache Airflow DAG: create tables, fetch generation and consumption data in parallel, then validate row counts.",
        "Parses the Eurostat API's multi-dimensional JSON, with retries and timeouts for reliability.",
        "PostgreSQL storage, with duplicate-safe inserts.",
        "Covers 8 countries and 6 generation sources for 2018 to 2024, in KTOE (kilotonne of oil equivalent).",
        "Streamlit dashboard with year and country filters, trends, and comparisons.",
        "Docker Compose runs the supporting services locally.",
      ],
      notes: [
        "The data is annual, not real-time.",
      ],
    },
  },
  {
    slug: "handwritten-character-recognition",
    title: "Handwritten Character Recognition (EMNIST)",
    summary:
      "A PyTorch CNN trained on the EMNIST balanced dataset (47 classes of digits and letters), with an inference script that preprocesses raw input images before predicting.",
    tags: ["PyTorch", "Python", "CNN", "EMNIST"],
    repoUrl: "https://github.com/Alca1206/digit_alphabet_cnn",
    status: "complete",
    category: "Deep Learning",
    detail: {
      overview:
        "A CNN that recognizes handwritten digits and letters, trained on the EMNIST balanced dataset (47 classes).",
      highlights: [
        "Trained in PyTorch; the training notebook downloads EMNIST through torchvision.",
        "Inference script that preprocesses an input image and predicts with the saved model weights.",
      ],
      notes: [
        "Accuracy results are coming soon.",
      ],
    },
  },
  {
    slug: "job-agent",
    title: "Job Agent",
    summary:
      "A tool that compares a job description with your CV using an LLM run through Ollama (Llama 3.1 8B) and generates a Markdown report: match score, skill gaps, a tailored cover letter, and interview tips. FastAPI backend with a Streamlit interface.",
    tags: ["Python", "FastAPI", "Streamlit", "Ollama", "LLM", "Docker"],
    repoUrl: "https://github.com/Alca1206/Job-Agent",
    status: "in-progress",
    category: "LLM Apps",
    detail: {
      overview:
        "A tool that compares a pasted job description with your CV and generates a Markdown report.",
      highlights: [
        "Report sections: match score, required skills, why you are a good fit, skill gaps, a tailored cover letter, and interview tips.",
        "Uses a language model run through Ollama (Llama 3.1 8B).",
        "FastAPI backend with a health-check endpoint, and a Streamlit front end for pasting a job description and uploading a CV.",
        "Docker support included.",
      ],
      notes: [
        "The match score is generated by a language model, so treat it as indicative, not measured.",
      ],
    },
  },
  {
    slug: "paperpilot",
    title: "PaperPilot",
    summary:
      "A local-first research-paper assistant that runs entirely on your own machine, with no paid APIs: Ollama (qwen3:8b for answers, embeddinggemma for search), PyMuPDF, ChromaDB and a Streamlit app. The goal is questions answered only from the uploaded paper with page-level citations, structured summaries, and APA, MLA, IEEE and BibTeX export. The foundation (configuration, Ollama health check, app shell, tests) is built; PDF ingestion, retrieval and Q&A are in progress.",
    tags: ["Python", "RAG", "Ollama", "ChromaDB", "Streamlit", "PyMuPDF"],
    repoUrl: "https://github.com/Alca1206/PaperPilot",
    status: "in-progress",
    category: "LLM Apps",
    detail: {
      overview:
        "A local-first assistant for reading academic papers: upload a PDF, get a structured summary, and ask questions answered only from that paper, with page-level citations.",
      highlights: [
        "Runs entirely on your own machine: no paid APIs, and no data leaves your computer.",
        "Language models run through Ollama: qwen3:8b writes answers and summaries, and embeddinggemma turns text into vectors for search.",
        "Planned pipeline: PDF pages extracted with PyMuPDF, split into chunks, embedded, and stored in a persistent ChromaDB index, then used for grounded question answering.",
        "Planned export of references in APA, MLA, IEEE and BibTeX.",
        "Foundation built: central configuration with environment-variable overrides, a health check that shows whether Ollama and both models are available, and a Streamlit app shell.",
        "Tested with pytest: unit tests use fake clients and need no Ollama, and the integration test is skipped when no Ollama server is running.",
        "A concept notebook prototypes the whole pipeline step by step, from models and PDF pages to chunks, retrieval, grounded Q&A, summaries and references.",
      ],
      notes: [
        "In active development. The project's roadmap lists PDF upload and chunking, embeddings and the index, grounded Q&A, summaries, and bibliography export as upcoming phases, so features marked planned above are goals, not finished work.",
        "Later ideas: comparing several papers, hybrid retrieval, and deployment.",
      ],
    },
  },
];

/** The project's own page address, or null if it has no detail page. */
export function projectPath(project: Project): string | null {
  return project.detail ? `/projects/${project.slug}` : null;
}
