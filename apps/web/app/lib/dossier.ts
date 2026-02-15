import { readFile } from "fs/promises";
import { join } from "path";

const DOSSIERS_DIR = join(process.cwd(), "..", "..", "journey", "dossiers");

export async function loadDossier(slug: string): Promise<string | null> {
  try {
    const filePath = join(DOSSIERS_DIR, `${slug}.md`);
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
