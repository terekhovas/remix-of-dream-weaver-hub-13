import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext"

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

function TestConsumer() {
  const { session, loading } = useAuthContext()
  if (loading) return <div>loading</div>
  return <div>{session ? "authenticated" : "unauthenticated"}</div>
}

describe("AuthContext", () => {
  it("renders children and shows unauthenticated when no session", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument()
    })
  })

  it("shows loading initially", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByText("loading")).toBeInTheDocument()
  })
})
