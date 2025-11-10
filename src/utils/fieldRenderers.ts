import { BasesEntry, BasesPropertyId } from 'obsidian';

/**
 * Tier classification for properties
 */
export type PropertyTier = 'tier-1' | 'tier-2' | 'tier-3' | 'unknown';

/**
 * Extract property name from BasesPropertyId (format: "type.name")
 */
export const extractPropertyName = (propertyId: BasesPropertyId): string => {
  if (!propertyId) return '';
  const parts = String(propertyId).split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : String(propertyId);
};

/**
 * Classify a property into a tier based on its name
 */
export const classifyPropertyTier = (propertyId: BasesPropertyId): PropertyTier => {
  const propName = extractPropertyName(propertyId).toLowerCase();

  // Tier 1: Critical information
  const tier1Patterns = [
    /^title$/,
    /^name$/,
    /^status$/,
    /^priority$/,
    /^assignee$/,
    /^assigned to$/,
    /^due date$/,
    /^duedate$/
  ];

  // Tier 2: Important context
  const tier2Patterns = [
    /^effort$/,
    /^points$/,
    /^progress$/,
    /^completion$/,
    /^linked/i,
    /^description$/,
    /^summary$/
  ];

  // Tier 3: Additional details
  const tier3Patterns = [
    /^tags$/,
    /^tag$/,
    /^custom/i,
    /^metadata/i,
    /^created/i,
    /^modified/i,
    /^updated/i,
    /^timestamp/i
  ];

  for (const pattern of tier1Patterns) {
    if (pattern.test(propName)) return 'tier-1';
  }

  for (const pattern of tier2Patterns) {
    if (pattern.test(propName)) return 'tier-2';
  }

  for (const pattern of tier3Patterns) {
    if (pattern.test(propName)) return 'tier-3';
  }

  return 'unknown';
};

/**
 * Get Tier 1 properties from available properties
 */
export const getTier1Properties = (
  availableProperties: BasesPropertyId[]
): BasesPropertyId[] => {
  return availableProperties.filter((propId) => classifyPropertyTier(propId) === 'tier-1');
};

/**
 * Get Tier 2 properties from available properties
 */
export const getTier2Properties = (
  availableProperties: BasesPropertyId[]
): BasesPropertyId[] => {
  return availableProperties.filter((propId) => classifyPropertyTier(propId) === 'tier-2');
};

/**
 * Get Tier 3 properties from available properties
 */
export const getTier3Properties = (
  availableProperties: BasesPropertyId[]
): BasesPropertyId[] => {
  return availableProperties.filter((propId) => classifyPropertyTier(propId) === 'tier-3');
};

/**
 * Render a field value with proper formatting
 */
export const renderFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.length > 100 ? value.substring(0, 97) + '...' : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((v) => String(v)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};
