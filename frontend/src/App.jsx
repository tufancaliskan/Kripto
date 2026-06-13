import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LearnPanel from "./pages/LearnPanel.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import TelegraphPage from "./pages/TelegraphPage.jsx";
import TranslatePanel from "./pages/TranslatePanel.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="learn" element={<LearnPanel />} />
        <Route path="translate" element={<TranslatePanel />} />
        <Route path="telegraph" element={<TelegraphPage />} />
        <Route path="quiz" element={<QuizPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
