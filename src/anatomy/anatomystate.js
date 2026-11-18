import { createContext, useContext } from "react";

export const AnatomyContext = createContext(null);

export function useAnatomy() {
  const value = useContext(AnatomyContext);
  if (!value) {
    throw new Error("useAnatomy must be used inside AnatomySection");
  }
  return value;
}
