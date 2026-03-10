# LUMIO AI — Cloud Intelligence Platform

> AI-powered cloud cost optimization, security analysis, and infrastructure recommendations

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your **Gemini API Key** (get free key at [aistudio.google.com](https://aistudio.google.com)).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
```bash
npx vercel deploy
```
Set environment variable `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel dashboard.

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| **File Upload** | Drag & drop .tf, .yaml files |
| **GitHub Simulation** | Simulated repo connection with sample files |
| **Cost Analysis** | Infracost-powered cost breakdown |
| **Security Scan** | Checkov/tfsec misconfiguration detection |
| **Multi-Agent AI** | FinOps + Security + Coordinator agents (LangGraph) |
| **Terraform Diff** | AI-generated HCL changes with validation |
| **Architecture Diagram** | Mermaid.js infrastructure visualization |
| **PR Creation** | GitHub API integration for pull requests |

## 🔑 API Keys Required

| Key | Where to Get | Required? |
|-----|-------------|-----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | **Yes** (for real analysis) |
| `GITHUB_ACCESS_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) | No (for real PR) |
| `INFRACOST_API_KEY` | [infracost.io](https://www.infracost.io/docs/) | No |

## 🏗️ Architecture

```
LUMIO AI
├── Gemini 2.0 Flash API     ← AI reasoning engine
├── LangGraph Agents         ← FinOps + Security + Coordinator
├── MCP Protocol             ← Tool integration layer
├── Infracost JSON           ← Cost analysis format
├── Checkov/tfsec JSON       ← Security analysis format
└── Next.js 15 Frontend      ← React 19, Tailwind, Recharts
```

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Charts**: Recharts (BarChart, AreaChart, RadarChart, PieChart)
- **Diagrams**: Mermaid.js
- **AI**: Google Gemini 2.0 Flash
- **Animations**: CSS animations, Framer Motion
- **Theme**: AWS-inspired dark theme with orange accents
