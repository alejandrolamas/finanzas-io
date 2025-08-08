// Formatea un número como moneda euro en formato español: 1.234,56 €
export function formatEuro(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return "0,00 €"
  const n = Number(value)
  // Formateo manual: separador de miles punto, decimales coma
  const [int, dec] = n.toFixed(2).split('.')
  const intWithDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${intWithDots},${dec} €`
}
