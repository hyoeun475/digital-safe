import { describe, expect, it } from "vitest";
import { ko } from "@/i18n/ko";
import { en } from "@/i18n/en";
import { INSTITUTIONS } from "@/data/institutions";

describe("i18n dictionaries", () => {
  it("en covers every ko key with non-empty text", () => {
    for (const key of Object.keys(ko) as (keyof typeof ko)[]) {
      expect(typeof en[key]).toBe("string");
      expect(en[key].trim().length).toBeGreaterThan(0);
    }
  });

  it("never promises absolute anonymity or completed reports", () => {
    const all = Object.values(ko).join("\n") + Object.values(en).join("\n");
    expect(all).not.toMatch(/무조건 익명이 보장/);
    expect(all).not.toMatch(/신고가 완료되었습니다/);
    expect(all).not.toMatch(/guaranteed anonymous/i);
  });
});

describe("institutions data", () => {
  it("has verified source and date for every institution", () => {
    for (const i of INSTITUTIONS) {
      expect(i.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(i.source.ko.length).toBeGreaterThan(0);
      if (i.url) expect(i.url.startsWith("https://")).toBe(true);
    }
  });
  it("contains the PRD-listed institutions", () => {
    const ids = INSTITUTIONS.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(["police_112", "ecrm", "d4u", "women1366"]));
  });
});
