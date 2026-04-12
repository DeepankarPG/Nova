/** Prefix for mock / STT voice transcript content (pipeline demo). UI must use `inputChannel: "voice"` — never rely on prefix alone (empty prefix would match every string via `startsWith("")`). */
export const ECHO_VOICE_MESSAGE_PREFIX = "[Voice — demo]";

/** @deprecated Prefer `FullPageMessage.inputChannel === "voice"` for UI; prefix can appear in pasted text. */
export function isEchoVoiceMessage(text: string): boolean {
  return text.trimStart().startsWith(ECHO_VOICE_MESSAGE_PREFIX);
}

/** Primary line: transcript after prefix, or fallback label. */
export function echoVoiceMessageTitle(text: string): string {
  const t = text.trimStart();
  if (!t.startsWith(ECHO_VOICE_MESSAGE_PREFIX)) return t;
  const rest = t.slice(ECHO_VOICE_MESSAGE_PREFIX.length).trim();
  return rest.length > 0 ? rest : "Voice message";
}
