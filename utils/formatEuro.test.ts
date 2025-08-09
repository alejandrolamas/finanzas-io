import { formatEuro } from "./formatEuro"

describe("formatEuro", () => {
  it("formatea correctamente cantidades pequeñas", () => {
    expect(formatEuro(0)).toBe("0,00 €")
    expect(formatEuro(1)).toBe("1,00 €")
    expect(formatEuro(12.5)).toBe("12,50 €")
    expect(formatEuro("12.5")).toBe("12,50 €")
  })

  it("formatea correctamente miles y millones", () => {
    expect(formatEuro(1234)).toBe("1.234,00 €")
    expect(formatEuro(1234567.89)).toBe("1.234.567,89 €")
    expect(formatEuro("1234567.89")).toBe("1.234.567,89 €")
  })

  it("devuelve 0,00 € para valores nulos, undefined o NaN", () => {
    expect(formatEuro(undefined)).toBe("0,00 €")
    expect(formatEuro(null)).toBe("0,00 €")
    expect(formatEuro(NaN)).toBe("0,00 €")
    expect(formatEuro("")).toBe("0,00 €")
  })

  it("redondea correctamente a dos decimales", () => {
    expect(formatEuro(1.999)).toBe("2,00 €")
    expect(formatEuro(1.994)).toBe("1,99 €")
    expect(formatEuro(1000.1)).toBe("1.000,10 €")
  })
})
