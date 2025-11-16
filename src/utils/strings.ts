/**
 * Unslugify a string (e.g., "my-string-example" -> "My String Example")
 *
 * @param str - The slugified string
 * @returns The unslugified string
 */
export function toSentenceCase(str: string): string {
    if (!str) return str;
    return str
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

export function toSlugCase(str: string): string {
    if (!str) return str;
    return str
        .toLowerCase()
        .replace(/\s+/g, '-');
}
