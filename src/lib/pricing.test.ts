import { describe, expect, it } from 'vitest';
import { DEFAULT_ESTIMATOR, DEFAULT_PLANS, estimate, estimatorSchema, formatUsd, planPriceLabel, planSchema } from './pricing';

describe('formatUsd', () => {
  it('formats whole dollars without cents', () => {
    expect(formatUsd(10000)).toBe('$100');
    expect(formatUsd(150000)).toBe('$1,500');
  });
  it('keeps cents when there are any', () => {
    expect(formatUsd(10050)).toBe('$100.50');
  });
});

describe('planPriceLabel', () => {
  it('shows "+" and "From" as configured', () => {
    expect(planPriceLabel({ priceCents: 25000, plus: true, from: false })).toEqual({ prefix: '', amount: '$250', suffix: '+' });
    expect(planPriceLabel({ priceCents: 60000, plus: false, from: true })).toEqual({ prefix: 'From', amount: '$600', suffix: '' });
  });
});

describe('defaults', () => {
  it('are valid', () => {
    expect(() => estimatorSchema.parse(DEFAULT_ESTIMATOR)).not.toThrow();
    for (const p of DEFAULT_PLANS) expect(() => planSchema.parse(p)).not.toThrow();
  });
  it('keep the supplied website prices', () => {
    const price = (id: string) => DEFAULT_PLANS.find((p) => p.id === id)!.priceCents;
    expect(price('basic-website')).toBe(10000);
    expect(price('pro-website')).toBe(18000);
    expect(price('corporate-website')).toBe(25000);
  });
});

describe('estimate', () => {
  const c = DEFAULT_ESTIMATOR;

  it('returns null when there is nothing to price', () => {
    expect(estimate(c, { service: 'unsure' })).toBeNull();
    expect(estimate(c, { service: 'website' })).toBeNull();
    expect(estimate(c, { service: 'website', type: 'nope' })).toBeNull();
  });

  it('prices the base type alone', () => {
    // business website $180, spread 1.4 → $252 rounded to $250
    expect(estimate(c, { service: 'website', type: 'business' })).toEqual({ lowCents: 18000, highCents: 25000 });
  });

  it('adds features and ignores unknown ones', () => {
    const r = estimate(c, { service: 'website', type: 'business', features: ['payments', 'whatsapp', 'not-a-feature'] });
    // 180 + 80 + 10 = 270 → high 378 → 400 (rounded to $50)
    expect(r).toEqual({ lowCents: 27000, highCents: 40000 });
  });

  it('uses a chosen package as the base', () => {
    expect(estimate(c, { service: 'website', type: 'business', packageCents: 25000 })?.lowCents).toBe(25000);
    expect(estimate(c, { service: 'app', packageCents: 150000 })?.lowCents).toBe(150000);
  });

  it('applies user tiers only where they matter', () => {
    const base = estimate(c, { service: 'software', type: 'crm' })!;
    const big = estimate(c, { service: 'software', type: 'crm', users: 'u250plus' })!;
    expect(big.lowCents).toBe(Math.round((base.lowCents * 1.6) / 1000) * 1000);
    expect(estimate(c, { service: 'website', type: 'business', users: 'u250plus' })).toEqual(estimate(c, { service: 'website', type: 'business' }));
  });

  it('charges for a rush timeline', () => {
    const normal = estimate(c, { service: 'app', type: 'customer', timeline: 'flexible' })!;
    const rush = estimate(c, { service: 'app', type: 'customer', timeline: 'asap' })!;
    expect(rush.lowCents).toBe(150000);
    expect(normal.lowCents).toBe(120000);
  });

  it('always returns whole-dollar, ordered ranges', () => {
    for (const service of ['website', 'app', 'software', 'webapp', 'automation'] as const) {
      for (const t of c.services[service].types) {
        const r = estimate(c, { service, type: t.id, features: c.services[service].features.map((f) => f.id), timeline: 'asap', users: 'u250' })!;
        expect(r.lowCents % 100).toBe(0);
        expect(r.highCents).toBeGreaterThanOrEqual(r.lowCents);
      }
    }
  });
});
