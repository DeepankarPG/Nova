const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function digitCount(s: string) {
  return (s.match(/\d/g) ?? []).length;
}

/**
 * Demo parser: customer share reply after a payment link (name + email + phone in one message).
 */
export type ShareFollowUpParse =
  | { kind: "declined" }
  | { kind: "need_details" }
  | { kind: "ok"; name: string; email: string; phone: string };

export function parseShareFollowUp(text: string): ShareFollowUpParse {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (
    /^(no|nope|nah|skip|not now|don'?t|dont)\b/i.test(trimmed) ||
    /\b(no thanks|not really|i don'?t)\b/i.test(lower)
  ) {
    return { kind: "declined" };
  }

  const emailMatch = trimmed.match(EMAIL_RE);
  const email = emailMatch?.[0]?.trim() ?? "";

  let phone = "";
  const spaced = trimmed.match(/\+?\d[\d\s().-]{6,}\d/);
  if (spaced && digitCount(spaced[0]) >= 8) {
    phone = spaced[0].replace(/\s+/g, " ").trim();
  }
  if (!phone) {
    const plain = trimmed.match(/\b\d{10,14}\b/);
    if (plain && digitCount(plain[0]) >= 10) {
      phone = plain[0];
    }
  }

  const yesOnly =
    /\b(yes|yeah|yep|sure|ok|okay|please|go ahead|yup)\b/i.test(trimmed) &&
    trimmed.length < 48 &&
    !email;

  if (yesOnly) {
    return { kind: "need_details" };
  }

  if (!email || digitCount(phone) < 8) {
    return { kind: "need_details" };
  }

  let name = trimmed
    .replace(email, " ")
    .replace(phone, " ")
    .replace(/[,;|]+/g, " ")
    .replace(/\b(yes|yeah|yep|sure|ok|okay|please|go ahead|yup)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (name.length < 2) {
    return { kind: "need_details" };
  }

  return { kind: "ok", name, email, phone };
}
