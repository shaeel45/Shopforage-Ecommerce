import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSearchSuggestions } from "../api";

const RECENT_KEY = "shopforge_recent_searches";
const MAX_RECENT = 5;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

const POPULAR_TERMS = ["Oxford", "Selvedge", "Sneakers", "Flannel", "Derby", "Chino"];

function readRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* storage can be unavailable (private mode); recent searches are optional */
  }
}

function formatPrice(price) {
  const value = Number(price) || 0;
  return `$${value.toFixed(2)}`;
}

function SearchBar({
  autoFocus = false,
  onClose,
  onSubmitted,
  placeholder = "Search products...",
  className = "",
  inputClassName = "",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [recent, setRecent] = useState(readRecentSearches);
  const [highlight, setHighlight] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const requestId = useRef(0);
  const listboxId = useId();

  const term = query.trim();
  const isSearching = term.length >= MIN_QUERY_LENGTH;

  const rememberSearch = useCallback((value) => {
    const cleaned = String(value || "").trim();
    if (!cleaned) return;
    setRecent((current) =>
      [cleaned, ...current.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(0, MAX_RECENT)
    );
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, []);

  // Persist recent searches (an external system → safe place for a side effect).
  useEffect(() => {
    writeRecentSearches(recent);
  }, [recent]);

  // Debounced autocomplete request. Stale responses are ignored through
  // a request id so fast typing never renders out-of-order results.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      // Bump the id so any in-flight response for a longer term is dropped.
      requestId.current += 1;
      return undefined;
    }

    const id = requestId.current + 1;
    requestId.current = id;

    const timer = setTimeout(() => {
      setLoading(true);
      fetchSearchSuggestions(trimmed, 5)
        .then((result) => {
          if (requestId.current !== id) return;
          setSuggestions(result);
          setHighlight(-1);
          setLoading(false);
        })
        .catch(() => {
          if (requestId.current !== id) return;
          setSuggestions(null);
          setHighlight(-1);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const groups = useMemo(() => {
    if (!isSearching) {
      return {
        recent: recent.map((value) => ({ kind: "recent", value, label: value })),
        products: [],
        categories: [],
        keywords: [],
      };
    }

    const payload = suggestions?.suggestions || {};
    return {
      recent: [],
      products: (payload.products || []).map((product) => ({
        kind: "product",
        value: product.name,
        label: product.name,
        product,
      })),
      categories: (payload.categories || []).map((category) => ({
        kind: "category",
        value: category.name,
        label: category.name,
        count: category.count,
      })),
      keywords: (payload.keywords || []).map((keyword) => ({
        kind: "keyword",
        value: keyword,
        label: keyword,
      })),
    };
  }, [isSearching, recent, suggestions]);

  const items = useMemo(
    () => [...groups.products, ...groups.categories, ...groups.keywords, ...groups.recent],
    [groups]
  );

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const finish = useCallback(() => {
    closeDropdown();
    setQuery("");
    setSuggestions(null);
    onSubmitted?.();
  }, [closeDropdown, onSubmitted]);

  const submit = useCallback(
    (value, item) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return;

      rememberSearch(trimmed);

      if (item?.kind === "product" && item.product?.id) {
        finish();
        navigate(`/product/${item.product.id}`);
        return;
      }

      if (item?.kind === "category") {
        finish();
        navigate(`/products?category=${encodeURIComponent(item.value)}`);
        return;
      }

      finish();
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [finish, navigate, rememberSearch]
  );

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      if (!items.length) return;
      setHighlight((current) => (current + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (!items.length) return;
      setHighlight((current) => (current - 1 + items.length) % items.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = highlight >= 0 ? items[highlight] : null;
      submit(active ? active.value : term, active);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (open) {
        closeDropdown();
      } else {
        setQuery("");
        onClose?.();
      }
    }
  };

  const handleClear = () => {
    if (query) {
      setQuery("");
      setSuggestions(null);
      inputRef.current?.focus();
      return;
    }
    closeDropdown();
    onClose?.();
  };

  const showDropdown = open;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-3 h-4 w-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlight(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-full border border-stone-300 bg-stone-100 py-2 pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden ${inputClassName}`}
        />

        {(query || onClose) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 rounded-full p-0.5 text-stone-400 transition hover:text-stone-800"
            aria-label={query ? "Clear search" : "Close search"}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[26rem] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl sm:left-auto sm:right-0 sm:w-[24rem]"
        >
          {isSearching && loading && items.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-stone-400">Searching…</div>
          )}

          {!isSearching && groups.recent.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 pb-1 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-[10px] font-medium text-stone-400 transition hover:text-stone-700"
                >
                  Clear
                </button>
              </div>
              <ul>
                {groups.recent.map((item, index) => (
                  <li key={`recent-${item.value}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={highlight === index}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => submit(item.value, item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        highlight === index ? "bg-stone-100" : "hover:bg-stone-50"
                      }`}
                    >
                      <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <span className="truncate text-stone-700">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!isSearching && groups.recent.length === 0 && (
            <div className="px-3 py-2">
              <p className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Popular right now
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TERMS.map((popular) => (
                  <button
                    key={popular}
                    type="button"
                    onClick={() => submit(popular)}
                    className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
                  >
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groups.products.length > 0 && (
            <div className="pt-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Products
              </p>
              <ul>
                {groups.products.map((item, index) => (
                  <li key={`product-${item.product.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={highlight === index}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => submit(item.value, item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        highlight === index ? "bg-stone-100" : "hover:bg-stone-50"
                      }`}
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 flex-none rounded-lg border border-stone-100 object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-stone-100 text-xs font-bold text-stone-500">
                          {item.label.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-stone-800">{item.label}</span>
                        {item.product.category && (
                          <span className="block truncate text-[11px] capitalize text-stone-400">
                            {item.product.category}
                          </span>
                        )}
                      </span>
                      <span className="flex-none text-xs font-semibold text-stone-700">
                        {formatPrice(item.product.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(groups.categories.length > 0 || groups.keywords.length > 0) && (
            <div className="mt-1 border-t border-stone-100 pt-1">
              <ul>
                {groups.categories.map((item, index) => {
                  const position = groups.products.length + index;
                  return (
                    <li key={`category-${item.value}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={highlight === position}
                        onMouseEnter={() => setHighlight(position)}
                        onClick={() => submit(item.value, item)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-left text-xs transition ${
                          highlight === position ? "bg-stone-100" : "hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-stone-700">
                          <svg className="h-3.5 w-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M4 6h16M4 12h16M4 18h10"
                            />
                          </svg>
                          Browse <span className="font-semibold capitalize">{item.label}</span>
                        </span>
                        <span className="text-[10px] text-stone-400">{item.count}</span>
                      </button>
                    </li>
                  );
                })}
                {groups.keywords.map((item, index) => {
                  const position = groups.products.length + groups.categories.length + index;
                  return (
                    <li key={`keyword-${item.value}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={highlight === position}
                        onMouseEnter={() => setHighlight(position)}
                        onClick={() => submit(item.value, item)}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs transition ${
                          highlight === position ? "bg-stone-100" : "hover:bg-stone-50"
                        }`}
                      >
                        <svg className="h-3.5 w-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                          />
                        </svg>
                        <span className="truncate text-stone-700">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {isSearching && !loading && items.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-stone-500">
              No matches for <span className="font-semibold text-stone-800">“{term}”</span>. Try another keyword.
            </div>
          )}

          {isSearching && (
            <button
              type="button"
              onClick={() => submit(term)}
              className="mt-1 flex w-full items-center justify-between rounded-xl bg-stone-900 px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-black"
            >
              <span className="truncate">
                View all results for “{term}”
              </span>
              <svg className="h-3.5 w-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
