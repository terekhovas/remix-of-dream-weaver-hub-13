import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Login from "@/pages/Login"

const mockSignIn = vi.fn()

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
    },
  },
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe("Login page", () => {
  beforeEach(() => {
    mockSignIn.mockReset()
  })

  it("renders email and password fields and a submit button", () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("calls supabase.auth.signInWithPassword with entered credentials", async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "sofia@renty.life" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ email: "sofia@renty.life", password: "secret123" })
    })
  })

  it("shows an error message when sign-in fails", async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: "Invalid credentials" } })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@email.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
