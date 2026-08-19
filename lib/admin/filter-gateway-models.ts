export function filterGatewayModelsByQuery<T extends { id: string }>(
  models: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return models;

  const matched = models.filter((model) => model.id.toLowerCase().includes(q));
  return [...matched].sort((a, b) => {
    const aId = a.id.toLowerCase();
    const bId = b.id.toLowerCase();
    const rank = (id: string) => {
      if (id === q) return 0;
      if (id.startsWith(q)) return 1;
      return 2;
    };
    return rank(aId) - rank(bId) || aId.localeCompare(bId);
  });
}
