// Single source of truth for the WhatsApp contact link. The number is the
// published business mobile from the Impressum (+49 163 8843453), in the
// international, digits-only format wa.me expects (no +, spaces or leading 0).
// If WhatsApp ever moves to a different number, change it here only.
const WHATSAPP_NUMBER = "491638843453";

const DEFAULT_TEXT =
  "Hallo Puron Media! Ich habe eine Frage und würde mich über eine kurze Rückmeldung freuen.";

export function whatsappUrl(text: string = DEFAULT_TEXT): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
