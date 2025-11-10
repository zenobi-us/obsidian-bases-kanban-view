import { describe, it, expect } from 'vitest';
import {
  classifyPropertyTier,
  extractPropertyName,
  getTier1Properties,
  getTier2Properties,
  getTier3Properties,
  renderFieldValue
} from '../../utils/fieldRenderers';

describe('fieldRenderers utilities', () => {
  describe('extractPropertyName', () => {
    it('should extract name from property ID', () => {
      expect(extractPropertyName('note.title' as any)).toBe('title');
      expect(extractPropertyName('formula.status' as any)).toBe('status');
    });

    it('should handle single part IDs', () => {
      expect(extractPropertyName('title' as any)).toBe('title');
    });

    it('should handle empty strings', () => {
      expect(extractPropertyName('' as any)).toBe('');
    });
  });

  describe('classifyPropertyTier', () => {
    it('should classify Tier 1 properties', () => {
      expect(classifyPropertyTier('note.title')).toBe('tier-1');
      expect(classifyPropertyTier('note.status')).toBe('tier-1');
      expect(classifyPropertyTier('note.priority')).toBe('tier-1');
      expect(classifyPropertyTier('note.assignee')).toBe('tier-1');
      expect(classifyPropertyTier('note.due date')).toBe('tier-1');
    });

    it('should classify Tier 2 properties', () => {
      expect(classifyPropertyTier('note.effort')).toBe('tier-2');
      expect(classifyPropertyTier('note.progress')).toBe('tier-2');
      expect(classifyPropertyTier('note.description')).toBe('tier-2');
    });

    it('should classify Tier 3 properties', () => {
      expect(classifyPropertyTier('note.tags')).toBe('tier-3');
      expect(classifyPropertyTier('note.created')).toBe('tier-3');
    });

    it('should classify unknown properties', () => {
      expect(classifyPropertyTier('note.unknown')).toBe('unknown');
    });
  });

  describe('getTier1Properties', () => {
    it('should filter Tier 1 properties', () => {
      const properties = ['note.title', 'note.status', 'note.tags', 'note.priority'] as any;
      const tier1 = getTier1Properties(properties);
      expect(tier1).toContain('note.title');
      expect(tier1).toContain('note.status');
      expect(tier1).toContain('note.priority');
      expect(tier1).not.toContain('note.tags');
    });
  });

  describe('getTier2Properties', () => {
    it('should filter Tier 2 properties', () => {
      const properties = ['note.effort', 'note.title', 'note.progress'] as any;
      const tier2 = getTier2Properties(properties);
      expect(tier2).toContain('note.effort');
      expect(tier2).toContain('note.progress');
      expect(tier2).not.toContain('note.title');
    });
  });

  describe('getTier3Properties', () => {
    it('should filter Tier 3 properties', () => {
      const properties = ['note.tags', 'note.title', 'note.created'] as any;
      const tier3 = getTier3Properties(properties);
      expect(tier3).toContain('note.tags');
      expect(tier3).toContain('note.created');
      expect(tier3).not.toContain('note.title');
    });
  });

  describe('renderFieldValue', () => {
    it('should render string values', () => {
      expect(renderFieldValue('hello')).toBe('hello');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(150);
      const result = renderFieldValue(longString);
      expect(result).toHaveLength(100);
      expect(result).toContain('...');
    });

    it('should render numbers', () => {
      expect(renderFieldValue(42)).toBe('42');
    });

    it('should render booleans', () => {
      expect(renderFieldValue(true)).toBe('true');
      expect(renderFieldValue(false)).toBe('false');
    });

    it('should render arrays', () => {
      expect(renderFieldValue(['a', 'b', 'c'])).toBe('a, b, c');
    });

    it('should handle null and undefined', () => {
      expect(renderFieldValue(null)).toBe('');
      expect(renderFieldValue(undefined)).toBe('');
    });
  });
});
