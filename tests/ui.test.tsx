import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/i18n";
import { SessionProvider } from "@/lib/session/SessionProvider";
import { InstitutionCard } from "@/components/InstitutionCard";
import { ModeBadge } from "@/components/ModeBadge";
import { EmergencyGuide } from "@/components/EmergencyBanner";
import { LanguageSwitch } from "@/components/AppShell";
import { INSTITUTIONS } from "@/data/institutions";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));

function wrap(ui: React.ReactElement) {
  return render(
    <LanguageProvider>
      <SessionProvider>{ui}</SessionProvider>
    </LanguageProvider>,
  );
}

describe("InstitutionCard", () => {
  it("renders verified links that open in a new tab and shows source/date", () => {
    const d4u = INSTITUTIONS.find((i) => i.id === "d4u")!;
    wrap(<InstitutionCard inst={d4u} />);
    const link = screen.getByRole("link", { name: /공식 사이트 열기/ });
    expect(link).toHaveAttribute("href", "https://d4u.stop.or.kr");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByText(d4u.lastVerified)).toBeInTheDocument();
  });

  it("renders a tel link for 112", () => {
    wrap(<InstitutionCard inst={INSTITUTIONS.find((i) => i.id === "police_112")!} />);
    expect(screen.getByRole("link", { name: /112/ })).toHaveAttribute("href", "tel:112");
  });
});

describe("ModeBadge", () => {
  it("clearly labels demo mode", () => {
    wrap(<ModeBadge mode="demo" modeReason="ai_not_configured" />);
    expect(screen.getByText(/데모 모드 — 실제 AI 분석이 아닙니다/)).toBeInTheDocument();
  });
  it("labels AI mode", () => {
    wrap(<ModeBadge mode="ai" modeReason="ai" />);
    expect(screen.getByText("실제 AI 모드")).toBeInTheDocument();
  });
});

describe("EmergencyGuide", () => {
  it("shows 112 first as an alert", () => {
    wrap(<EmergencyGuide />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("112");
    expect(screen.getByRole("link", { name: /112/ })).toHaveAttribute("href", "tel:112");
  });
});

describe("LanguageSwitch", () => {
  it("switches text to English", () => {
    wrap(
      <>
        <LanguageSwitch />
        <ModeBadge mode="demo" modeReason="ai_not_configured" />
      </>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
    expect(screen.getByText(/Demo mode — not real AI analysis/)).toBeInTheDocument();
  });
});
