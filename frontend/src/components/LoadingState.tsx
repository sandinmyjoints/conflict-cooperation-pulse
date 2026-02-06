interface LoadingStateProps {
  error?: string | null;
}

export function LoadingState({ error }: LoadingStateProps) {
  if (error) {
    return (
      <div className="loading-state loading-state--error" role="alert">
        <h2>Failed to load data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="loading-state" aria-busy="true" aria-label="Loading data">
      <div className="loading-state__skeleton">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton-column">
            <div className="skeleton-title" />
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className="skeleton-row" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
