import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudyDataProvider } from "@/contexts/StudyDataContext";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizPage from "@/pages/QuizPage";
import UnitsPage from "@/pages/UnitsPage";
import UnitDetail from "@/pages/UnitDetail";
import AddUnitPage from "@/pages/AddUnitPage";
import ExamTechniquePage from "@/pages/ExamTechniquePage";
import NotebookPage from "@/pages/NotebookPage";
import ProvePage from "@/pages/ProvePage";
import MockExamPage from "@/pages/MockExamPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <StudyDataProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/flashcards" element={<FlashcardsPage />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/units" element={<UnitsPage />} />
                        <Route path="/units/:unitId" element={<UnitDetail />} />
                        <Route path="/add-unit" element={<AddUnitPage />} />
                        <Route path="/exam-technique" element={<ExamTechniquePage />} />
                        <Route path="/notebook" element={<NotebookPage />} />
                        <Route path="/prove" element={<ProvePage />} />
                        <Route path="/mock-exam" element={<MockExamPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </RequireAuth>
                }
              />
            </Routes>
          </StudyDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
