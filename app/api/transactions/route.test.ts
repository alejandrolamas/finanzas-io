
jest.mock("@/lib/dbConnect", () => ({ __esModule: true, default: jest.fn() }))
jest.mock("@/lib/auth", () => ({ requireAuth: jest.fn().mockResolvedValue({ userId: "507f1f77bcf86cd799439011" }) }))
jest.mock("@/models/Account", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), updateOne: jest.fn() }
}))
jest.mock("@/models/Transaction", () => ({
  __esModule: true,
  default: { find: jest.fn(), findById: jest.fn(), save: jest.fn() }
}))

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import mongoose from "mongoose"
import { POST, GET } from "./route"
// Mock ObjectId para aceptar cualquier string en tests
jest.spyOn(mongoose.Types, "ObjectId").mockImplementation((v: any) => v)
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"

describe("/api/transactions API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("debería rechazar gastos mayores al saldo disponible", async () => {
    // Simula cuenta existente con balance bajo
  (Account.findOne as any).mockResolvedValue({ _id: "fakeid", userId: "507f1f77bcf86cd799439011", balance: 10 })
    const req = { json: async () => ({ type: "expense", amount: 999999, account: "fakeid" }) } as any
    const res = await POST(req)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/saldo disponible/i)
  })

  it("debería devolver error si la cuenta no existe", async () => {
  (Account.findOne as any).mockResolvedValue(null)
    const req = { json: async () => ({ type: "income", amount: 10, account: "fakeid" }) } as any
    const res = await POST(req)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/cuenta no encontrada/i)
  })

  it("debería devolver un array en GET aunque no haya filtros", async () => {
    // Mock chainable .populate and .sort returning an array
    const mockPopulate = jest.fn().mockReturnThis();
  const mockSort = jest.fn(() => Promise.resolve([]));
    (Transaction.find as any).mockReturnValue({
      populate: mockPopulate,
      sort: mockSort
    });
    const req = { url: "http://localhost/api/transactions" } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });
})
