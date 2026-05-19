import { describe, it, expect } from "vitest"
import { supabase } from "./supabase"

describe("supabase client", () => {
  it("exports a supabase client instance", () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.getSession).toBe("function")
    expect(typeof supabase.from).toBe("function")
  })
})
