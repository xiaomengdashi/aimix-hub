/** models.dev Price column: `$input / $output` per 1M tokens */

export function formatUsdPerMillion(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "$0.00";
  const abs = Math.abs(value);
  if (abs < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function formatModelsDevPrice(
  input: number | null | undefined,
  output: number | null | undefined,
): string {
  if (input == null && output == null) return "—";
  return `${formatUsdPerMillion(input)} / ${formatUsdPerMillion(output)}`;
}

export function parsePriceInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}
