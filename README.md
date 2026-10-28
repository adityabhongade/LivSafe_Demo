# LivSafe Demo

LivSafe Demo is a self-contained, interactive prototype of LivSafe. It demonstrates clinician-facing dashboards, simulated fibrosis staging, image review tools, and patient record workflows. 

**Expeience the demo [here](http://adityabhongade.github.io/LivSafe_Demo)**.

## Citation

Dubey, Y., Bhongade, A., & Fulzele, P. (2025). *LivSCP: Improving Liver Fibrosis Classification Through Supervised Contrastive Pretraining*. **Diagnostics, 15**(24), 3226. [https://doi.org/10.3390/diagnostics15243226](https://doi.org/10.3390/diagnostics15243226)

```bibtex
@Article{livscp,
  AUTHOR = {Dubey, Yogita and Bhongade, Aditya and Fulzele, Punit},
  TITLE = {LivSCP: Improving Liver Fibrosis Classification Through Supervised Contrastive Pretraining},
  JOURNAL = {Diagnostics},
  VOLUME = {15},
  YEAR = {2025},
  NUMBER = {24},
  ARTICLE-NUMBER = {3226},
  DOI = {10.3390/diagnostics15243226}
}
```

## Correspondence

Address any correspondence to [adityabhongade24@gmail.com](mailto:adityabhongade24@gmail.com) / [aabhongade@ycce.edu](mailto:aabhongade@ycce.edu).

## License

This project is distributed under the [MIT License](LICENSE)

> **Research and demonstration use only.** LivSafe Demo is not a diagnostic medical device and must not be used to make patient care decisions. Records, classifier outputs, activation maps, assistant responses, and citations are simulated examples. The application does not connect to the production backend, database, classifier, or retrieval system.

## Getting started

### Requirements

- Node.js 18 or later
- npm

### Install and run

From the project directory:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

On Windows PowerShell, if the `npm` command is blocked by the execution policy, use `npm.cmd`:

```powershell
npm.cmd ci
npm.cmd run dev
```

## Demo access

Use the preconfigured clinician account on the login page:

| Field | Value |
| --- | --- |
| Username | `user01` |
| Password | `user_pass1` |
| Demo profile | Dr. Alex Taylor, Hepatology |

The login page also provides an auto-fill option for these credentials.

## What the demo includes

- **Clinician dashboard:** example workload statistics, METAVIR grade distribution, and recent records.
- **Ultrasound review:** sample-image loading and simulated METAVIR stages from F0 to F4, with illustrative, uncalibrated confidence scores.
- **Activation map:** a generated Grad-CAM-style visualization for demonstration.
- **Assistant chat:** scripted decision-support responses with example references to AASLD, EASL, and WFUMB materials.
- **Visual review drafts:** structured observations accompanied by technical limitations and uncertainty notes.
- **Patient records and reports:** record browsing and client-side PDF exports.
- **Organization views:** example analytics and patient management screens.

## How it works

The frontend is a React single-page application. Its API layer routes requests to an in-browser mock backend; records are stored in browser `localStorage`. Uploads, analyses, assistant replies, and report drafts are simulated. No external database, Python environment, machine-learning model, or retrieval service is required.

An optional standalone mock HTTP server is available for API demonstrations:

```bash
npm run server
```

It listens on port `5000` by default. The frontend does not require this server.

## Project commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run check` | Run the TypeScript type check |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run server` | Start the optional standalone mock server |

## Technology Stack

React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Wouter, and TanStack Query. The application is configured for GitHub Pages deployment through the workflow in `.github/workflows/pages.yml`.

ICENSE).
