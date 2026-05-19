import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAuth } from "./useAuth"
import { AuthProvider } from "@/contexts/AuthContext"
import { ReactNode } from "react"

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe("useAuth", () => {
  it("returns session, profile, and loading from context", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toHaveProperty("session")
    expect(result.current).toHaveProperty("profile")
    expect(result.current).toHaveProperty("loading")
  })

  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuthContext must be used inside AuthProvider"
    )
  })
})
