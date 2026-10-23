# LivSafe Demo

LivSafe Demo is a lightweight, shareable, and self-contained interactive prototype of the **LivSafe** liver ultrasound review platform. The frontend labels the site as a demo throughout. Records, classifier results, activation maps, and assistant responses are simulated; the demo does not connect to the production backend, database, classifier, or retrieval system.

> [!IMPORTANT]
> **Clinical Disclaimer**: LivSafe is an investigational prototype and **not a diagnostic medical device**. It is intended strictly for research and clinical workflow demonstration.

---

## Quick Start

### 1. Requirements
* Node.js (v18+) & npm

### 2. Run the Demo
```bash
# From the LivSafe_Demo folder:
npm ci
npm run dev
```

Open your browser at **http://localhost:5173**. The site-wide banner identifies the experience as a demo and notes that its data and outputs are simulated.

---

## Default Demo Credentials

Log in with the pre-configured clinician account:

| Field | Value |
|---|---|
| **Username / Email** | `user01` |
| **Password** | `user_pass1` |
| **Role** | Clinician / Hepatologist (`Dr. Alex Taylor`) |

*(A one-click "Auto-fill" button is also provided directly on the Login screen).*

---

## Key Features Demonstrated

1. **Doctor Dashboard**:
   - Clinical workload metrics, METAVIR grade distribution breakdown (F0–F4), and recent patient case reviews.
2. **Ultrasound Upload & METAVIR Staging**:
   - Simulated Vision Transformer (ViT) model inference providing METAVIR fibrosis stages (F0: Normal to F4: Cirrhosis) with confidence scores and uncalibrated softmax probability distributions.
   - Built-in *"Quick-load Sample Ultrasound"* button to test analysis instantly without needing external images.
3. **Grad-CAM Activation Heatmaps**:
   - Generates and renders indicative visual activation heatmaps to highlight image regions contributing to the classification.
4. **MedRAG Decision-Support Assistant**:
   - AI conversational assistant providing answers citing clinical guidelines (AASLD, EASL, WFUMB) with bracketed inline citations `[1]`, `[2]`, `[3]`.
5. **Ultrasound Visual Review Drafts**:
   - Structured visual-only ultrasound observation draft with explicit technical limitations and uncertainty notes.
6. **Patient Records & PDF Export**:
   - Comprehensive case review and exportable PDF summaries.

---

## Architecture & Self-Contained Demo

Unlike the full system (which requires MongoDB, PyTorch, CUDA, ChromaDB, and local llama.cpp servers), this demo is self-contained:
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI.
* **Dummy Backend**: Built-in mock API engine providing realistic clinical responses, state persistence via browser storage, and zero external database or Python dependencies.
* **Optional Standalone Mock Server**: `npm run server` starts a separate Node.js mock HTTP server on port 5000. The frontend uses the in-browser mock API and does not require this server.

All classifier scores are illustrative and uncalibrated. Assistant responses and citations are examples, not verified clinical guidance. Do not use this demo for patient care.

## GitHub Pages

The `main` branch deploys the static demo through GitHub Actions. In the repository settings, open **Settings → Pages** and set the publishing source to **GitHub Actions**. After pushing to `main`, the workflow builds and publishes the site at:

`https://adityabhongade.github.io/LivSafe_Demo/`

The deployment build uses `/LivSafe_Demo/` as its base path and includes a fallback for direct links to client-side routes. If the repository is renamed, update the base path in `vite.config.ts`, the route fallback in `public/404.html`, and this URL.
