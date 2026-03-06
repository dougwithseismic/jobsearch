export async function copyToClipboard(text: string): Promise<void> {
  try {
    const { default: clipboardy } = await import('clipboardy');
    await clipboardy.write(text);
  } catch {
    // Clipboard not available in some environments
  }
}
