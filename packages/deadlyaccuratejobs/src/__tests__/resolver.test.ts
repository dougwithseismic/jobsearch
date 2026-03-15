import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { resolveCompany, getStats, clearCache } from "../resolver.js";

// These tests hit the live KV API — they're integration tests
describe("resolver (live)", () => {
  afterAll(() => clearCache());

  it("resolves Stripe on greenhouse", async () => {
    const matches = await resolveCompany("Stripe");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]!.ats).toBe("greenhouse");
    expect(matches[0]!.slug).toBe("stripe");
    expect(matches[0]!.confidence).toBe("exact");
  });

  it("resolves Notion on ashby", async () => {
    const matches = await resolveCompany("Notion");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const ashby = matches.find((m) => m.ats === "ashby");
    expect(ashby).toBeDefined();
    expect(ashby!.slug).toBe("notion");
  });

  it("resolves Spotify on lever", async () => {
    const matches = await resolveCompany("Spotify");
    const lever = matches.find((m) => m.ats === "lever");
    expect(lever).toBeDefined();
    expect(lever!.slug).toBe("spotify");
  });

  it("returns empty for unknown company", async () => {
    const matches = await resolveCompany("xyznonexistentcompany12345");
    expect(matches).toHaveLength(0);
  });

  it("gets platform stats", async () => {
    const stats = await getStats();
    expect(stats.totalSlugs).toBeGreaterThan(0);
    expect(stats.platforms.length).toBeGreaterThanOrEqual(8);
    for (const p of stats.platforms) {
      expect(p.slugCount).toBeGreaterThanOrEqual(0);
    }
  });
});
