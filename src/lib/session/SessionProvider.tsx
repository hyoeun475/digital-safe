"use client";

/**
 * 상담 세션 상태. 브라우저 메모리(React state)에만 존재한다.
 * - localStorage / sessionStorage / 서버 저장 없음 → 탭 종료·새로고침 시 삭제된다.
 * - PRD 7.1 "데이터 최소화" 요구사항 구현.
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  ConsultationResponse,
  EvidenceDetails,
  EvidenceItem,
  IncidentType,
  RiskAnswer,
  Situation,
} from "@/types/consultation";
import { createEmptyChecklist } from "@/features/evidence/checklist";

export type Intake = {
  immediateRisk: RiskAnswer | null;
  incidentType: IncidentType | null;
  situation: Situation | null;
  description: string;
  aiConsent: boolean;
};

export type SessionState = {
  intake: Intake;
  evidence: EvidenceItem[];
  evidenceDetails: EvidenceDetails;
  result: ConsultationResponse | null;
  draft: string | null;
  draftRequest: string;
};

const initialIntake: Intake = {
  immediateRisk: null,
  incidentType: null,
  situation: null,
  description: "",
  aiConsent: false,
};

const initialDetails: EvidenceDetails = {
  incidentDate: "",
  discoveredDate: "",
  platformOrLocation: "",
  url: "",
  description: "",
};

export function createInitialSession(): SessionState {
  return {
    intake: { ...initialIntake },
    evidence: createEmptyChecklist(),
    evidenceDetails: { ...initialDetails },
    result: null,
    draft: null,
    draftRequest: "",
  };
}

type SessionContextValue = {
  state: SessionState;
  updateIntake: (patch: Partial<Intake>) => void;
  updateEvidenceItem: (id: EvidenceItem["id"], patch: Partial<Omit<EvidenceItem, "id">>) => void;
  updateEvidenceDetails: (patch: Partial<EvidenceDetails>) => void;
  setResult: (r: ConsultationResponse | null) => void;
  setDraft: (d: string | null) => void;
  setDraftRequest: (s: string) => void;
  resetAll: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(createInitialSession);

  const updateIntake = useCallback((patch: Partial<Intake>) => {
    setState((s) => ({ ...s, intake: { ...s.intake, ...patch } }));
  }, []);

  const updateEvidenceItem = useCallback(
    (id: EvidenceItem["id"], patch: Partial<Omit<EvidenceItem, "id">>) => {
      setState((s) => ({
        ...s,
        evidence: s.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [],
  );

  const updateEvidenceDetails = useCallback((patch: Partial<EvidenceDetails>) => {
    setState((s) => ({ ...s, evidenceDetails: { ...s.evidenceDetails, ...patch } }));
  }, []);

  const setResult = useCallback((result: ConsultationResponse | null) => {
    setState((s) => ({ ...s, result }));
  }, []);

  const setDraft = useCallback((draft: string | null) => {
    setState((s) => ({ ...s, draft }));
  }, []);

  const setDraftRequest = useCallback((draftRequest: string) => {
    setState((s) => ({ ...s, draftRequest }));
  }, []);

  const resetAll = useCallback(() => setState(createInitialSession()), []);

  const value = useMemo(
    () => ({
      state,
      updateIntake,
      updateEvidenceItem,
      updateEvidenceDetails,
      setResult,
      setDraft,
      setDraftRequest,
      resetAll,
    }),
    [state, updateIntake, updateEvidenceItem, updateEvidenceDetails, setResult, setDraft, setDraftRequest, resetAll],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
