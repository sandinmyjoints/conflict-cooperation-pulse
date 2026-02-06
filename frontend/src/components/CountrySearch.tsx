interface CountrySearchProps {
  value: string;
  onChange: (q: string) => void;
}

export function CountrySearch({ value, onChange }: CountrySearchProps) {
  return (
    <label className="country-search">
      <span className="country-search__label">Country search</span>
      <input
        type="text"
        className="country-search__input"
        placeholder="Filter by country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter pairs by country name or code"
      />
    </label>
  );
}
