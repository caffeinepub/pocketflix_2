export function anonymizeUser(userIdentifier: string): string {
  // Create a stable anonymized label from the user identifier
  // Take first 4 characters after the last dash for uniqueness
  const parts = userIdentifier.split('-');
  const lastPart = parts[parts.length - 1];
  const shortId = lastPart.substring(0, 4).toUpperCase();
  return `User ${shortId}`;
}
