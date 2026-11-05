import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout';
import { Home } from './pages/Home';
import { CourseMap } from './pages/CourseMap';
import { ModulePage } from './pages/ModulePage';
import { ReviewPage } from './pages/ReviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignIn';

// The code editor is the heaviest dependency: load it only on pages that need it.
const ProblemPage = lazy(() => import('./pages/ProblemPage').then((m) => ({ default: m.ProblemPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then((m) => ({ default: m.ExamPage })));
const Playground = lazy(() => import('./pages/Playground').then((m) => ({ default: m.Playground })));

const Loading = () => <div className="run-status" style={{ margin: '2rem auto', maxWidth: 320 }}><span className="spinner" aria-hidden />Loading the editor…</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="learn" element={<CourseMap />} />
            <Route path="module/:id" element={<ModulePage />} />
            <Route path="problem/:id" element={<ProblemPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="exam/:phaseId" element={<ExamPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="signin" element={<SignInPage />} />
            <Route path="playground" element={<Playground />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
