import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

interface AnalysisPayload {
  sow: string;
  message: string;
  hourlyRate?: number;
}

app.post("/api/analyze", async (req, res) => {
  const { sow, message, hourlyRate } = req.body as AnalysisPayload;

  if (!sow || !message) {
    return res.status(400).json({ error: "Both SOW and client message are required." });
  }

  const rate = Number(hourlyRate) || 85;

  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      const prompt = `
You are ScopeGuard AI, an expert freelance contract & scope negotiation strategist.
Analyze the client's request against the agreed Scope of Work (SOW).

Agreed Scope of Work (SOW):
"""
${sow}
"""

Client Request / Message:
"""
${message}
"""

Freelancer Hourly Rate Base: $${rate}/hr

Analyze and return JSON matching the schema:
1. verdict: "IN_SCOPE", "GRAY_AREA", or "OUT_OF_SCOPE"
2. confidenceScore: 0 to 100
3. reasoningSummary: 2-3 clear sentences explaining why this is in scope, gray area, or out of scope.
4. deliverableMatch:
   - explicitlyCovered: items in request that match SOW
   - outOfBounds: new deliverables or tasks requested beyond SOW
5. estimatedExtraHours: estimated additional hours needed (e.g. 12)
6. suggestedAddOnFee: calculated as extra hours * hourly rate ($${rate}/hr), rounded nicely.
7. riskFactors: 2-3 specific risks (e.g., timeline delay, revision creep, unbudgeted backend work)
8. responses: 3 tailored email negotiation options:
   - politeUpsell: Enthusiastic response accepting the feature provided client approves an add-on change order.
   - alternativeOffer: Suggests swapping an existing uncompleted item from the SOW to accommodate this within budget.
   - phase2Deferral: Congratulates client on the idea and suggests adding it as Phase 2 after launch.
`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are ScopeGuard AI, an expert freelance contract and scope negotiation strategist. You analyze client requests against agreed Scope of Work contracts and output STRICT JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                description: "Must be IN_SCOPE, GRAY_AREA, or OUT_OF_SCOPE",
              },
              confidenceScore: { type: Type.INTEGER },
              reasoningSummary: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              deliverableMatch: {
                type: Type.OBJECT,
                properties: {
                  explicitlyCovered: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  outOfBounds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["explicitlyCovered", "outOfBounds"],
              },
              estimatedExtraHours: { type: Type.NUMBER },
              estimated_extra_hours: { type: Type.NUMBER },
              suggestedAddOnFee: { type: Type.NUMBER },
              suggested_fee: { type: Type.NUMBER },
              riskFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              responses: {
                type: Type.OBJECT,
                properties: {
                  politeUpsell: {
                    type: Type.OBJECT,
                    properties: {
                      subject: { type: Type.STRING },
                      body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                  },
                  alternativeOffer: {
                    type: Type.OBJECT,
                    properties: {
                      subject: { type: Type.STRING },
                      body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                  },
                  phase2Deferral: {
                    type: Type.OBJECT,
                    properties: {
                      subject: { type: Type.STRING },
                      body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                  },
                },
                required: ["politeUpsell", "alternativeOffer", "phase2Deferral"],
              },
            },
            required: [
              "verdict",
              "responses",
            ],
          },
        },
      });

      if (response.text) {
        const raw = JSON.parse(response.text);
        
        // Normalize snake_case and camelCase fields
        const rawResp = raw.responses || {};
        const politeUpsell = rawResp.politeUpsell || rawResp.upsell || {
          subject: "Re: Update on requested additions for project",
          body: `Hi there,\n\nThanks for reaching out! These requested additions fall outside our agreed SOW.\n\nI can add this as a scope change order for $${raw.suggested_fee || raw.suggestedAddOnFee || 500}.\n\nLet me know if you would like me to prepare the change order!`,
        };
        const alternativeOffer = rawResp.alternativeOffer || rawResp.alternative || {
          subject: "Re: Options for incorporating your new feedback",
          body: "Hi there,\n\nTo stay within our original budget, we can swap out an uncompleted deliverable from our current SOW to accommodate this request.",
        };
        const phase2Deferral = rawResp.phase2Deferral || rawResp.defer_phase2 || {
          subject: "Re: Great idea for Phase 2 post-launch!",
          body: "Hi there,\n\nI love this suggestion! To ensure we meet our launch date, I recommend adding this to our Phase 2 roadmap immediately following launch.",
        };

        const hours = Number(raw.estimatedExtraHours ?? raw.estimated_extra_hours ?? 0);
        const fee = Number(raw.suggestedAddOnFee ?? raw.suggested_fee ?? (hours * rate));

        const normalizedResult = {
          verdict: (raw.verdict || "OUT_OF_SCOPE").toUpperCase(),
          confidenceScore: Number(raw.confidenceScore || 90),
          reasoningSummary: raw.reasoningSummary || raw.reasoning || "Analyzed against agreed scope parameters.",
          deliverableMatch: raw.deliverableMatch || {
            explicitlyCovered: ["Core agreed SOW deliverables"],
            outOfBounds: ["Additional scope items requested in message"],
          },
          estimatedExtraHours: hours,
          suggestedAddOnFee: fee,
          riskFactors: raw.riskFactors || ["Timeline extension", "Unbudgeted development hours"],
          responses: {
            politeUpsell,
            alternativeOffer,
            phase2Deferral,
          },
        };

        return res.json(normalizedResult);
      }
    }
  } catch (err) {
    console.error("Gemini analysis error, using fallback analyzer:", err);
  }

  // Fallback local smart analysis
  const fallback = performLocalAnalysis(sow, message, rate);
  return res.json(fallback);
});

function performLocalAnalysis(sow: string, message: string, rate: number) {
  const lowerSow = sow.toLowerCase();
  const lowerMsg = message.toLowerCase();

  // Out of scope trigger words
  const outKeywords = [
    "custom", "ecommerce", "shop", "cart", "payment", "cms", "database",
    "animation", "3d", "extra page", "rebrand", "redesign", "illustration",
    "additional", "overhaul", "mobile app", "api", "integration", "seo campaign",
    "translation", "multi-language", "portal"
  ];

  // Gray area words
  const grayKeywords = [
    "tweak", "minor change", "adjust", "font", "color", "re-order", "alignment",
    "slightly different", "feedback", "small update", "polish"
  ];

  let outScore = 0;
  let grayScore = 0;

  outKeywords.forEach((kw) => {
    if (lowerMsg.includes(kw) && !lowerSow.includes(kw)) {
      outScore += 2;
    }
  });

  grayKeywords.forEach((kw) => {
    if (lowerMsg.includes(kw)) {
      grayScore += 1;
    }
  });

  let verdict: "IN_SCOPE" | "GRAY_AREA" | "OUT_OF_SCOPE" = "IN_SCOPE";
  let extraHours = 0;

  if (outScore >= 2 || lowerMsg.length > 300) {
    verdict = "OUT_OF_SCOPE";
    extraHours = Math.max(8, outScore * 4);
  } else if (outScore === 1 || grayScore >= 1) {
    verdict = "GRAY_AREA";
    extraHours = 3;
  } else {
    verdict = "IN_SCOPE";
    extraHours = 0;
  }

  const suggestedFee = extraHours * rate;

  if (verdict === "OUT_OF_SCOPE") {
    return {
      verdict: "OUT_OF_SCOPE",
      confidenceScore: 94,
      reasoningSummary: "The requested items introduce new technical deliverables (such as custom backend features, extra page layouts, or extended revisions) that were not specified in the original SOW agreement.",
      deliverableMatch: {
        explicitlyCovered: [
          "Core visual layout & design framework defined in SOW",
          "Standard content placement & existing static pages"
        ],
        outOfBounds: [
          "Custom dynamic feature / integration requested in message",
          "Unbudgeted iteration rounds exceeding agreed limits",
          "Additional asset creation / third-party service setup"
        ]
      },
      estimatedExtraHours: extraHours,
      suggestedAddOnFee: Math.round(suggestedFee / 10) * 10 || 680,
      riskFactors: [
        "Project delivery milestone shift (+1 to 2 weeks)",
        "Unplanned development hours impacting margin",
        "Setting client precedent for unpaid feature creep"
      ],
      responses: {
        politeUpsell: {
          subject: "Re: Update on requested additions for project",
          body: `Hi there,\n\nThanks for reaching out! The ideas you mentioned sound like a great enhancement for the project.\n\nSince these additional features (such as custom integrations / new pages) fall outside our original SOW agreement, I'd be glad to add them as an add-on scope order. \n\nI've estimated this will take approximately ${extraHours} additional hours at $${rate}/hr (total estimated add-on of $${Math.round(suggestedFee)}). \n\nLet me know if you'd like me to send over a quick 1-page Change Order so we can get started right away!`
        },
        alternativeOffer: {
          subject: "Re: Options for incorporating your new feedback",
          body: `Hi there,\n\nThanks for the message! To make sure we stay strictly within our current target launch date and budget, I have a budget-neutral option for you.\n\nWe can swap out one of the lower-priority deliverables from our current SOW (e.g., secondary content styling) and replace it with this new request.\n\nAlternatively, if you'd prefer to keep all original deliverables intact, we can approve a quick $${Math.round(suggestedFee)} add-on. Which direction would you prefer?`
        },
        phase2Deferral: {
          subject: "Re: Great idea for Phase 2 post-launch!",
          body: `Hi there,\n\nI love this suggestion! To ensure we meet our upcoming launch deadline with maximum quality, I recommend we lock in our current Phase 1 deliverables as agreed in our SOW.\n\nI have added this request to our official Phase 2 Roadmap list. Right after launch, we can kick off Phase 2 with an estimated budget of $${Math.round(suggestedFee)}.\n\nHow does that sound for keeping our momentum going?`
        }
      }
    };
  } else if (verdict === "GRAY_AREA") {
    return {
      verdict: "GRAY_AREA",
      confidenceScore: 78,
      reasoningSummary: "The request touches upon existing deliverables in the SOW, but stretches boundary limits or involves extra refinement cycles that could consume unbudgeted time.",
      deliverableMatch: {
        explicitlyCovered: [
          "Original design framework & core deliverables",
          "Standard feedback incorporation round"
        ],
        outOfBounds: [
          "Refinements exceeding standard tweak thresholds",
          "Ambiguous scope boundaries requiring explicit sign-off"
        ]
      },
      estimatedExtraHours: 3,
      suggestedAddOnFee: Math.round(3 * rate),
      riskFactors: [
        "Minor timeline delay if feedback loops multiply",
        "Potential confusion on what constitutes a final revision"
      ],
      responses: {
        politeUpsell: {
          subject: "Re: Quick clarification on your feedback request",
          body: `Hi there,\n\nThanks for sending these notes over! I'm happy to apply these adjustments as part of our final revision round.\n\nTo ensure we stay aligned with our agreed SOW, please note that any further structural changes beyond these notes would fall into an additional revision block ($${Math.round(3 * rate)}). \n\nPlease confirm if these are the final set of changes you'd like applied!`
        },
        alternativeOffer: {
          subject: "Re: Streamlining your requested adjustments",
          body: `Hi there,\n\nThanks for the feedback! We can definitely accommodate these tweaks. To stay within our target deadline, I'll focus on the primary adjustments you highlighted first.\n\nLet me know if this priority order works best for you!`
        },
        phase2Deferral: {
          subject: "Re: Feedback status and next steps",
          body: `Hi there,\n\nGot it! I've incorporated the core adjustments into our current build. For the extended customization items, I recommend capturing them in our post-launch polish list so we don't delay our scheduled milestone.\n\nLet me know if that works for you!`
        }
      }
    };
  } else {
    return {
      verdict: "IN_SCOPE",
      confidenceScore: 98,
      reasoningSummary: "This client request directly aligns with the agreed deliverables and fits squarely within standard project revision/delivery scope.",
      deliverableMatch: {
        explicitlyCovered: [
          "Deliverables specifically detailed in SOW",
          "Standard milestone deliverables & agreed revisions"
        ],
        outOfBounds: []
      },
      estimatedExtraHours: 0,
      suggestedAddOnFee: 0,
      riskFactors: [
        "Low risk — ensure prompt confirmation to keep timeline moving"
      ],
      responses: {
        politeUpsell: {
          subject: "Re: Got it! Working on your request now",
          body: `Hi there,\n\nThanks for sending this over! This is fully covered in our agreed SOW, so I've already queued it up.\n\nI'll share an update as soon as it's ready for review!`
        },
        alternativeOffer: {
          subject: "Re: Confirmed — In progress",
          body: `Hi there,\n\nLooks great! This fits right into our scheduled deliverable set. I'm on it and will send over the preview shortly.`
        },
        phase2Deferral: {
          subject: "Re: Confirmed — In progress",
          body: `Hi there,\n\nThanks! This aligns with our current milestone goals. Everything is on track for our planned delivery.`
        }
      }
    };
  }
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScopeGuard AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
