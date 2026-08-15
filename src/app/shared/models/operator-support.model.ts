/**
 * Modelos para el Operator Support Agent (IA-07).
 * Contrato con POST /agents/operator-support/*
 * (suggest-tour-content, price-alert, draft-review-reply, validate-gallery).
 */

// ---------------------------------------------------------------------------
// suggest-tour-content
// ---------------------------------------------------------------------------

export interface SuggestTourContentDraft {
  name: string;
  categoryId: number;
  subcategoryId?: number | null;
  durationMinutes: number;
  minAge: number;
  priceType: string;
  isUnlimitedCapacity?: boolean;
  currentDescription?: string;
}

export interface SuggestTourContentRequest {
  tourId?: number | null;
  draft: SuggestTourContentDraft;
}

export interface TourContentSuggestion {
  nameSuggestions?: string[];
  descriptionSuggestion?: string;
  tagSuggestions?: string[];
  reasoning?: string;
}

// ---------------------------------------------------------------------------
// price-alert
// ---------------------------------------------------------------------------

export type PriceAlertSeverity = 'OK' | 'WARN' | 'CRITICAL';

export interface ComparablePriceRange {
  min?: number;
  max?: number;
  median?: number;
}

export interface PriceAlert {
  severity: PriceAlertSeverity;
  providerPrice?: number;
  comparablePriceRange?: ComparablePriceRange;
  reasoning?: string;
}

// ---------------------------------------------------------------------------
// draft-review-reply
// ---------------------------------------------------------------------------

export type ReviewReplyTone = 'PROFESSIONAL' | 'WARM' | 'APOLOGETIC' | string;

export interface DraftReviewReplyResponse {
  draftText: string;
  tone?: ReviewReplyTone;
  reasoning?: string;
}

// ---------------------------------------------------------------------------
// validate-gallery
// ---------------------------------------------------------------------------

export interface ImageMetadata {
  filename: string;
  sizeBytes: number;
  widthPx: number;
  heightPx: number;
  format: string;
}

export interface ValidateGalleryRequest {
  images: ImageMetadata[];
}

export type GalleryIssueSeverity = 'WARN' | 'CRITICAL' | string;

export interface GalleryValidationIssue {
  severity: GalleryIssueSeverity;
  code: string;
  message?: string;
  fileIndex?: number;
}

export interface ValidateGalleryResponse {
  isValid: boolean;
  issues?: GalleryValidationIssue[];
  suggestions?: string[];
}

// ---------------------------------------------------------------------------
// envelope (ApiResponse<T>)
// ---------------------------------------------------------------------------

export interface OperatorSupportEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}
