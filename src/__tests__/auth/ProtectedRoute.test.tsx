import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

const mockUseAuth = vi.fn()
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }))

function renderWithRouter(ui: React.ReactElement, initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ session: { user: { id: "1" } }, loading: false })
    renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(screen.getByText("dashboard")).toBeInTheDocument()
  })

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false })
    renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(screen.getByText("login page")).toBeInTheDocument()
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument()
  })

  it("renders nothing while loading", () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true })
    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(container.firstChild).toBeNull()
  })
})
