import { useState, useEffect, useCallback } from "react";
import type { Unit, StudyTopic } from "@/data/studyContent";

const STORAGE_KEY = "sociostudy-custom-units";

interface CustomUnitData {
  unit: Unit;
  topics: StudyTopic[];
}

export function useCustomUnits() {
  const [customData, setCustomData] = useState<CustomUnitData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));
  }, [customData]);

  const addUnit = useCallback((unit: Unit, topics: StudyTopic[]) => {
    setCustomData((prev) => [...prev, { unit, topics }]);
  }, []);

  const removeUnit = useCallback((unitId: string) => {
    setCustomData((prev) => prev.filter((d) => d.unit.id !== unitId));
  }, []);

  const allCustomUnits: Unit[] = customData.map((d) => d.unit);
  const allCustomTopics: StudyTopic[] = customData.flatMap((d) => d.topics);

  return { customData, allCustomUnits, allCustomTopics, addUnit, removeUnit };
}
