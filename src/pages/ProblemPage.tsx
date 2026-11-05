import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ALL_MODULES, findProblem } from '../content';
import { isModuleUnlocked } from '../state/progress';
import { useProgress } from '../state/store';
import { ProblemWorkspace } from '../ui/ProblemWorkspace';

export function ProblemPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = useProgress();
  const found = id ? findProblem(id) : undefined;
  if (!found || !found.module) return <Navigate to="/learn" replace />;
  const { problem, module } = found;
  if (!isModuleUnlocked(module.id, s)) return <Navigate to={`/module/${module.id}`} replace />;

  const idx = module.problems.findIndex((p) => p.id === problem.id);
  const nextP = module.problems[idx + 1];
  const mi = ALL_MODULES.findIndex((m) => m.id === module.id);
  const next = nextP
    ? { label: `Next: ${nextP.title}`, href: `/problem/${nextP.id}` }
    : { label: 'Go to the mastery gate', href: `/module/${ALL_MODULES[mi].id}?step=gate` };

  return (
    <div className="problem-page">
      <nav className="crumbs small" aria-label="Breadcrumb">
        <Link to="/learn">Course</Link> › <Link to={`/module/${module.id}?step=practice`}>{module.id} {module.title}</Link> › <b>{problem.title}</b>
        <span className="crumb-nav">
          {idx > 0 && <Link to={`/problem/${module.problems[idx - 1].id}`}>← Prev</Link>}
          <span className="muted">{idx + 1}/{module.problems.length}</span>
          {nextP && <Link to={`/problem/${nextP.id}`}>Next →</Link>}
        </span>
      </nav>
      <ProblemWorkspace problem={problem} next={next} navigate={nav} />
    </div>
  );
}
