import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import puppeteer from "puppeteer";

const SCREENSHOTS_DIR = join(process.cwd(), "public", "screenshots");

function urlToFilename(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return `${hostname}.png`;
  } catch {
    return `${url.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const filename = urlToFilename(url);
  const filepath = join(SCREENSHOTS_DIR, filename);

  // Serve cached screenshot
  if (existsSync(filepath)) {
    return NextResponse.json({ src: `/screenshots/${filename}` });
  }

  // Take a new screenshot
  let browser;
  try {
    await mkdir(SCREENSHOTS_DIR, { recursive: true });

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    await page.screenshot({ path: filepath, type: "png" });
    await browser.close();

    return NextResponse.json({ src: `/screenshots/${filename}` });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json(
      { error: "Failed to capture screenshot" },
      { status: 500 }
    );
  }
}
