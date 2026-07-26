# ScopeGuard AI
> **AI-Powered Scope Creep Detection & Automated Client Negotiation Web Application for Freelancers**

---

## Live Application & Repository

* **Live Deployed Web App:** https://scope-guard-ai.vercel.app
* **GitHub Repository:** https://github.com/Astudent04/ScopeGuard-AI

---

## Problem Statement & Target Audience

### **The Real Problem:** 
Unpaid scope expansion ("scope creep") causes project delays, client friction, and unpaid work for freelancers when clients request extra features beyond agreed contracts.

### **The Solution:** 
**ScopeGuard AI** cross-references incoming client requests against Statements of Work (SOW) in real time to evaluate scope compliance, calculate extra fees, and generate negotiation emails.

### **Target Audience:** 
Developers, UI/UX Designers, Copywriters, Marketers, Agencies, and Project Managers.

---

## Key Features & Capabilities

* **Real-Time SOW Analysis:** Cross-examines client requests against contract parameters.
* **3-Tier Verdict Classification:**
  * **`IN_SCOPE`:** Covered under current contract terms.
  * **`GRAY_AREA`:** Requires boundary enforcement to avoid budget inflation.
  * **`OUT_OF_SCOPE`:** New feature requiring a formal Change Order.
* **Financial & Extra Hour Estimator:** Calculates additional hours and fee recommendations based on custom hourly rates.
* **3-Strategy Email Generator:**
  * **Polite Upsell:** Accepts feature conditionally with a Change Order.
  * **Alternative Offer (Scope Swap):** Swaps an uncompleted task to protect deadline and budget.
  * **Phase 2 Deferral:** Pushes new additions to post-launch roadmap.
* **Audit History Logging:** Automatically stores past evaluations locally so you can revisit, re-open, and review past contract decisions anytime.
* **One-Click Actions:** Instant clipboard copy for email subjects and body text.
* **Smart Fallback:** Local client-side fallback logic during API limits.

---

## AI Implementation & System Prompt

ScopeGuard AI uses **Google Gemini 1.5 Flash** (`@google/genai` SDK) with strict JSON output formatting.

### **System Prompt Specification:**

<pre>
You are ScopeGuard AI, an expert freelance contract and scope negotiation strategist.
Analyze the client request against the agreed Scope of Work (SOW) and output STRICT JSON.

Agreed SOW: "{sow_text}"
Client Request: "{client_message}"
Hourly Rate Base: ${hourly_rate}/hr

Return JSON schema:
1. verdict: "IN_SCOPE" | "GRAY_AREA" | "OUT_OF_SCOPE"
2. confidenceScore: 0 to 100
3. reasoningSummary: Concise 2-sentence explanation.
4. deliverableMatch: { explicitlyCovered: [], outOfBounds: [] }
5. estimatedExtraHours: Number
6. suggestedAddOnFee: Number (extra hours * hourly rate)
7. riskFactors: Array of specific project risks
8. responses: 3 email options (politeUpsell, alternativeOffer, phase2Deferral) with subject & body.
</pre>

---

## Tools, Services & Execution

| Layer | Technology | Role & Execution |
| :--- | :--- | :--- |
| **AI Model:** | **Google Gemini 1.5 Flash** | Processing contract analysis via API requests. |
| **Frontend:** | **React 19 & TypeScript** | Rendering UI components and app state. |
| **Build Tool:** | **Vite 6** | Bundling ESM assets (`npm run dev` / `npm run build`). |
| **Styling:** | **Tailwind CSS v4** | Utility-first responsive web styling. |
| **Icons & Animation:** | **Lucide React & Motion** | UI iconography and motion transitions. |
| **Deployment:** | **Vercel** | Live edge network hosting tied to GitHub repository. |

---

## Application Screenshots

### **1. Contract & Request Input:**
![Dashboard Input Interface](https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000001)

### **2. Verdict & Impact Analysis:**
![Scope Verdict Breakdown](https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000002)

### **3. Generated Negotiation Emails & Audit History:**
![Email Response Generator](https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000003)

---

## How to Run Locally

1. **Clone repository:**
   `git clone https://github.com/Astudent04/ScopeGuard-AI.git`
   `cd ScopeGuard-AI`

2. **Install dependencies:**
   `npm install`

3. **Environment Setup:** Create `.env.local` file in root:
   `VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"`

4. **Start Development Server:**
   `npm run dev`

---

## Author & License

* **Developer:** Ariba Kashif
* **Project:** ScopeGuard AI
* **License:** MIT License
