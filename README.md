# PM Copilot demo

A responsive project-management command center with a project-aware Copilot experience.

## Run locally

```bash
npm install
npm run dev
```

## Demo data

All dashboard and Copilot source data is kept in `src/data/projectData.js`. Replace the exported `projectData` object with API data, or preserve the same shape and hydrate it at runtime.

The demo Copilot uses deterministic intent matching so it works without a backend or API key. `answerFromProjectData()` is the seam to replace with a real LLM/RAG endpoint.
