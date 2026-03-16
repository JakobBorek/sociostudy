import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudyDataProvider } from "@/contexts/StudyDataContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizPage from "@/pages/QuizPage";
import UnitsPage from "@/pages/UnitsPage";
import UnitDetail from "@/pages/UnitDetail";
import AddUnitPage from "@/pages/AddUnitPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StudyDataProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/units" element={<UnitsPage />} />
              <Route path="/units/:unitId" element={<UnitDetail />} />
              <Route path="/add-unit" element={<AddUnitPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </StudyDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
