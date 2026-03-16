import React, { createContext, useContext } from "react";
import { units as builtInUnits, topics as builtInTopics, type Unit, type StudyTopic } from "@/data/studyContent";
import { useCustomUnits } from "@/hooks/useCustomUnits";

interface StudyDataContextType {
  units: Unit[];
  topics: StudyTopic[];
  addUnit: (unit: Unit, topics: StudyTopic[]) => void;
  removeUnit: (unitId: string) => void;
}

const StudyDataContext = createContext<StudyDataContextType>({
  units: builtInUnits,
  topics: builtInTopics,
  addUnit: () => {},
  removeUnit: () => {},
});

export function StudyDataProvider({ children }: { children: React.ReactNode }) {
  const { allCustomUnits, allCustomTopics, addUnit, removeUnit } = useCustomUnits();

  const mergedUnits = [...builtInUnits, ...allCustomUnits];
  const mergedTopics = [...builtInTopics, ...allCustomTopics];

  return (
    <StudyDataContext.Provider value={{ units: mergedUnits, topics: mergedTopics, addUnit, removeUnit }}>
      {children}
    </StudyDataContext.Provider>
  );
}

export function useStudyData() {
  return useContext(StudyDataContext);
}
