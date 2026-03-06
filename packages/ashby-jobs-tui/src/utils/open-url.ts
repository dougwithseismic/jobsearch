export async function openUrl(url: string): Promise<void> {
  const open = (await import('open')).default;
  await open(url);
}
