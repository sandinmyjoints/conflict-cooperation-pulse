import { timeAgo } from "../utils/formatters";

interface HeaderProps {
  generatedAt: string | null;
  isStale: boolean;
}

export function Header({ generatedAt, isStale }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__text">
        <h1 className="header__title">Conflict/Cooperation Pulse</h1>
        <p className="header__subtitle">
          Global bilateral relationship trends from GDELT event data
        </p>
      </div>
      {generatedAt && (
        <div className={`header__updated${isStale ? " header__updated--stale" : ""}`}>
          Updated {timeAgo(generatedAt)}
          {isStale && <span className="header__stale-warning"> (data may be stale)</span>}
        </div>
      )}
    </header>
  );
}
