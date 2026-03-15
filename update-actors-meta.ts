#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const AUTH = JSON.parse(readFileSync(join(process.env.HOME!, ".apify", "auth.json"), "utf-8"));
const TOKEN = AUTH.token;
const API = "https://api.apify.com/v2/acts";

// 2 weeks from now for price changes
const TWO_WEEKS = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

interface ActorConfig {
  id: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  pricePerResult: number;
}

const ACTORS: ActorConfig[] = [
  {
    id: "shARfvH3khPvImoHN",
    title: "Greenhouse Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 500+ Greenhouse companies. Auto-discovers boards. Structured output: title, department, location, salary, seniority, apply URL. Unified/raw/both output modes. Filter by location, department, keyword.",
    seoTitle: "Greenhouse Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 500+ Greenhouse career sites. Structured output with location, salary, seniority. No manual URLs needed.",
    pricePerResult: 0.0015,
  },
  {
    id: "5pVN3mj6brJ2d2wu7",
    title: "Lever Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 300+ Lever companies. Auto-discovers boards. Structured output: title, team, department, location, workplace type, apply URL. Unified/raw/both output modes. Filter by location, department, keyword.",
    seoTitle: "Lever Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 300+ Lever career sites. Structured output with location, salary, seniority. No manual URLs needed.",
    pricePerResult: 0.0015,
  },
  {
    id: "a6iPNVFsAtk8kaYsn",
    title: "Ashby Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 330+ Ashby companies. Auto-discovers boards. Structured output: title, department, team, compensation, workplace type, addresses, apply URL. Unified/raw/both output modes.",
    seoTitle: "Ashby Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 330+ Ashby career sites. Structured output with compensation, workplace type, and seniority.",
    pricePerResult: 0.0015,
  },
  {
    id: "uE5EBBxMaf8TsX6er",
    title: "Workable Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 470+ Workable companies. Auto-discovers boards. Structured locations (city/state/country), workplace type, apply URL. Latest v3 API with pagination. Unified/raw/both output modes.",
    seoTitle: "Workable Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 470+ Workable career sites. Structured locations, salary parsing, seniority. Latest v3 API.",
    pricePerResult: 0.002,
  },
  {
    id: "lMLVODQUSYBL64bXW",
    title: "SmartRecruiters Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 590+ SmartRecruiters companies (Visa, Bosch, Siemens, Adidas). Auto-discovers boards. Experience level, industry, department, location, apply URL. Pagination. Unified/raw/both output.",
    seoTitle: "SmartRecruiters Job Scraper | Apify",
    seoDescription: "Discover and scrape job listings from 590+ SmartRecruiters career sites including enterprise companies. Structured output with experience level.",
    pricePerResult: 0.001,
  },
  {
    id: "InPkj0WsiVCg08urt",
    title: "BreezyHR Jobs Scraper — All Companies, All Jobs",
    description: "Only dedicated BreezyHR scraper on Apify. 360+ companies. Auto-discovers boards. Title, department, salary, location, logo URL, apply URL. Unified/raw/both output modes.",
    seoTitle: "BreezyHR Job Scraper — All Companies | Apify",
    seoDescription: "The only dedicated BreezyHR scraper on Apify. Discover and scrape job listings from 360+ BreezyHR career sites with salary parsing and structured output.",
    pricePerResult: 0.002,
  },
  {
    id: "XYqex5DbPG1pqFDZ4",
    title: "Personio Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 280+ Personio companies across German and European markets. Auto-discovers boards. Title, department, seniority, schedule, keywords, descriptions. Unified/raw/both output modes.",
    seoTitle: "Personio Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 280+ Personio European career sites. Rich metadata: seniority, schedule, keywords. Structured output.",
    pricePerResult: 0.002,
  },
  {
    id: "Re6ZHliubx6uZ4qlw",
    title: "Recruitee Jobs Scraper — All Companies, All Jobs",
    description: "Scrape jobs from 160+ Recruitee companies. Auto-discovers boards. Title, department, location, tags, employment type, remote status, apply URL. Unified/raw/both output modes.",
    seoTitle: "Recruitee Job Scraper — All Companies | Apify",
    seoDescription: "Discover and scrape job listings from 160+ Recruitee-powered career sites. Structured output with tags, employment type, and salary parsing.",
    pricePerResult: 0.002,
  },
  {
    id: "6yIzafQOIC3S6cnhm",
    title: "Hacker News Jobs Scraper — Who is Hiring",
    description: "Scrape HN \"Who is Hiring\" threads. Extracts company, title, location, remote, salary, technologies from unstructured text. Multi-month coverage. Unified/raw/both output.",
    seoTitle: "HN Who is Hiring Scraper | Apify",
    seoDescription: "Automatically scrape and parse job listings from HN Who is Hiring threads. Extracts company, salary, technologies, remote status from unstructured text.",
    pricePerResult: 0.0005,
  },
];

async function getExistingPricing(id: string): Promise<any[] | null> {
  const res = await fetch(`${API}/${id}?token=${TOKEN}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { data: { pricingInfos?: any[] } };
  return data.data.pricingInfos ?? null;
}

function buildPricing(pricePerResult: number, existing: any[] | null): any[] {
  const newEntry = {
    pricingModel: "PAY_PER_EVENT" as const,
    startedAt: TWO_WEEKS,
    pricingPerEvent: {
      actorChargeEvents: {
        "apify-actor-start": {
          eventTitle: "Actor start",
          eventDescription: "Charged when the Actor starts running. One event per GB of memory.",
          isOneTimeEvent: true,
          eventPriceUsd: 0.00005,
        },
        "apify-default-dataset-item": {
          eventTitle: "Result",
          eventDescription: "Each job listing in the output dataset.",
          eventPriceUsd: pricePerResult,
          isPrimaryEvent: true,
        },
      },
    },
  };

  if (existing && existing.length > 0) {
    // Must include existing entries as prefix, then append new one
    return [...existing, newEntry];
  }

  return [newEntry];
}

async function updateActor(actor: ActorConfig): Promise<void> {
  const existing = await getExistingPricing(actor.id);
  const pricing = buildPricing(actor.pricePerResult, existing);

  const body = {
    title: actor.title,
    description: actor.description,
    seoTitle: actor.seoTitle,
    seoDescription: actor.seoDescription,
    notice: null,
    isPublic: true,
    categories: ["JOBS", "AUTOMATION", "DEVELOPER_TOOLS"],
    pricingInfos: pricing,
  };

  const res = await fetch(`${API}/${actor.id}?token=${TOKEN}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status} — ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { data: { name: string } };
  const perK = (actor.pricePerResult * 1000).toFixed(2);
  console.log(`  ${data.data.name.padEnd(32)} ✅  $${perK}/1K | public | live`);
}

async function main() {
  console.log(`Updating 9 Apify actors (price changes effective ${TWO_WEEKS.split("T")[0]})...\n`);

  for (const actor of ACTORS) {
    try {
      await updateActor(actor);
    } catch (e: any) {
      console.error(`  ${actor.id.padEnd(32)} ❌  ${e.message}`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
