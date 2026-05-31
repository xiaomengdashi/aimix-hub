"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type FC,
  type ReactNode,
} from "react";

type ArtifactBlockIndexContextValue = {
  getNextIndex: () => number;
};

const ArtifactBlockIndexContext =
  createContext<ArtifactBlockIndexContextValue | null>(null);

export const ArtifactBlockIndexProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const indexRef = useRef(0);

  const getNextIndex = useCallback(() => {
    const next = indexRef.current;
    indexRef.current += 1;
    return next;
  }, []);

  useEffect(() => {
    indexRef.current = 0;
  });

  return (
    <ArtifactBlockIndexContext.Provider value={{ getNextIndex }}>
      {children}
    </ArtifactBlockIndexContext.Provider>
  );
};

export function useArtifactBlockIndex(): number {
  const context = useContext(ArtifactBlockIndexContext);
  const indexRef = useRef<number | null>(null);

  if (indexRef.current === null) {
    indexRef.current = context?.getNextIndex() ?? 0;
  }

  return indexRef.current;
}
