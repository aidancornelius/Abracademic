/**
 * Core types for the Abracademic extension
 */

export type AccessMethod =
  | 'openathens'
  | 'ezproxy'
  | 'libkey'
  | 'unpaywall'
  | 'googlescholar'
  | 'annasarchive'
  | 'direct';

export interface ExtensionConfig {
  // Institution settings
  openAthensEntityId?: string;
  ezproxyPrefix?: string;
  ezproxySuffix?: string;
  libkeyLibraryId?: string;

  // Behavior flags
  defaultMethod: AccessMethod;
  enableFallback: boolean;
  enablePostProxyProbe: boolean;
  maxRedirectHops: number;
  redirectTimeout: number; // milliseconds

  // Fallback order
  fallbackOrder: AccessMethod[];
}

export interface Identifier {
  type: 'doi' | 'isbn' | 'pmid' | 'pmcid' | 'arxiv';
  value: string;
  normalized: string;
}

export interface ProcessingResult {
  success: boolean;
  originalUrl: string;
  finalUrl?: string;
  method?: AccessMethod;
  identifiers: Identifier[];
  canonicalUrl?: string;
  error?: string;
  redirectHops?: number;
  fallbackAttempts?: number;
  casaTokenDetected?: boolean;
  timestamp: number;
}

export interface UnwrapResult {
  url: string;
  hops: number;
  timedOut: boolean;
}

export interface PublisherRule {
  pattern: RegExp;
  canonicalize: (url: URL) => string | null;
  toPdf?: (url: URL) => string | null;
}

export interface ProbeResult {
  accessible: boolean;
  statusCode?: number;
  error?: string;
}

// Storage schema
export interface StorageData {
  config: ExtensionConfig;
  lastResult?: ProcessingResult;
}

// Message types for communication between popup/options and background
export interface Message {
  action: 'processUrl' | 'getConfig' | 'setConfig' | 'getLastResult';
  payload?: any;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}
