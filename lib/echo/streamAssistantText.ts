/** Stream assistant body for mock “typing” (word chunks). */

function chunkDelayMs() {
  return 12 + Math.floor(Math.random() * 10);
}

export async function streamAssistantBody(
  full: string,
  onUpdate: (accumulated: string) => void,
  options: { reducedMotion: boolean }
): Promise<void> {
  if (!full) {
    onUpdate("");
    return;
  }
  if (options.reducedMotion) {
    onUpdate(full);
    return;
  }

  const tokens = full.split(/(\s+)/);
  let acc = "";
  for (const t of tokens) {
    acc += t;
    onUpdate(acc);
    await new Promise<void>((r) => setTimeout(r, chunkDelayMs()));
  }
}
