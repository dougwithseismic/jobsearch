import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") || "outreach";

  const filename =
    variant === "default" ? "cv.json" : `cv-${variant}.json`;

  const filePath = join(process.cwd(), "..", "..", "assets", filename);

  try {
    const data = await readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    // Fallback to default CV
    const fallback = join(process.cwd(), "..", "..", "assets", "cv.json");
    const data = await readFile(fallback, "utf-8");
    return NextResponse.json(JSON.parse(data));
  }
}
