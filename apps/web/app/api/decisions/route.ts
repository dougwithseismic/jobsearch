import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const FILE_PATH = join(process.cwd(), "..", "..", "decisions.json");

async function readDecisions(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET() {
  const decisions = await readDecisions();
  return NextResponse.json(decisions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const current = await readDecisions();
  const updated = { ...current, ...body };
  await writeFile(FILE_PATH, JSON.stringify(updated, null, 2));
  return NextResponse.json(updated);
}

export async function DELETE() {
  await writeFile(FILE_PATH, JSON.stringify({}, null, 2));
  return NextResponse.json({});
}
