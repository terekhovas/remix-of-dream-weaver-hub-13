// src/__tests__/PropertiesTable.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PropertiesTable } from "@/components/properties/PropertiesTable";
import { properties } from "@/data/mockData";

describe("PropertiesTable", () => {
  it("renders without crashing and shows at least one property", () => {
    render(<PropertiesTable properties={properties} />);
    // The table should render some rows — just check for the search input and a header
    expect(screen.getByPlaceholderText(/search properties/i)).toBeInTheDocument();
    expect(screen.getByText(/Property/i)).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<PropertiesTable properties={properties} />);
    expect(screen.getByText("Mgmt Agreement")).toBeInTheDocument();
    expect(screen.getByText("Deposit")).toBeInTheDocument();
    expect(screen.getByText("Keys")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Service Charges")).toBeInTheDocument();
  });

  it("renders with empty properties array without crashing", () => {
    render(<PropertiesTable properties={[]} />);
    expect(screen.getByPlaceholderText(/search properties/i)).toBeInTheDocument();
  });

  it("shows property count in footer", () => {
    render(<PropertiesTable properties={properties} />);
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
  });
});
