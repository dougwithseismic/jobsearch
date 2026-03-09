import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { setSearchFocused } from "../lib/useBoardStore";

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  function handleChange(newValue: string) {
    setValue(newValue);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (newValue) {
        params.set("q", newValue);
      } else {
        params.delete("q");
      }
      params.delete("page");
      params.delete("cursor");
      params.delete("direction");
      setSearchParams(params);
    }, 300);
  }

  function handleClear() {
    setValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.delete("page");
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        data-search-input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholder="Search jobs, companies, locations... (press / to focus)"
        className="w-full bg-bg-alt border border-border rounded-lg py-2.5 pl-10 pr-10 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
