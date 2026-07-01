const HARNESS_URL = "https://dotsure-build-harness.vercel.app";

export default function BuildsPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="card p-8 max-w-lg">
        <p className="label mb-2">Builds</p>
        <h1 className="text-text-primary font-medium text-lg mb-2">
          Have a build idea?
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          Submit it to the Dotsure Build Harness. It scopes the idea, proposes a
          tech stack, and assesses risk. A low-risk idea that needs no new
          infrastructure gets a straight go-ahead to build it yourself. Anything
          else generates a full document set and registers an approval request
          for the relevant stakeholders.
        </p>

        <a
          href={`${HARNESS_URL}/pipeline`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center mb-3"
        >
          Submit a build idea
        </a>

        <div className="flex gap-3">
          <a
            href={`${HARNESS_URL}/projects`}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex-1 text-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            View all builds
          </a>
          <a
            href={`${HARNESS_URL}/approvals`}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex-1 text-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            View approvals
          </a>
        </div>
      </div>
    </div>
  );
}
