export type VerdictType = 'IN_SCOPE' | 'GRAY_AREA' | 'OUT_OF_SCOPE';

export interface EmailResponseOption {
  subject: string;
  body: string;
}

export interface AnalysisResult {
  id?: string;
  timestamp?: string;
  verdict: VerdictType;
  confidenceScore: number;
  reasoningSummary: string;
  deliverableMatch: {
    explicitlyCovered: string[];
    outOfBounds: string[];
  };
  estimatedExtraHours: number;
  suggestedAddOnFee: number;
  riskFactors: string[];
  responses: {
    politeUpsell: EmailResponseOption;
    alternativeOffer: EmailResponseOption;
    phase2Deferral: EmailResponseOption;
  };
  sowSnippet?: string;
  messageSnippet?: string;
}

export interface SowTemplate {
  id: string;
  name: string;
  category: 'Web Design' | 'Branding' | 'Software Dev' | 'Marketing & SEO' | 'Copywriting' | 'Other';
  deliverables: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  sow: string;
  message: string;
  verdict: VerdictType;
  confidenceScore: number;
  reasoningSummary: string;
  estimatedExtraHours: number;
  suggestedAddOnFee: number;
  result: AnalysisResult;
}
