import { useEffect, useRef, useState } from 'react';
import { HiOutlineMapPin } from 'react-icons/hi2';

export default function CityAutocomplete({ label, value = '', onChange, placeholder = 'Search city', error }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runSearch = (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&featuretype=city`, {
      headers: { 'Accept-Language': 'en' },
    })
      .then((r) => r.json())
      .then((data) => {
        const cities = data
          .filter((d) => d.class === 'place' || d.type === 'city' || d.type === 'town' || d.type === 'administrative')
          .map((d) => {
            const a = d.address || {};
            const city = a.city || a.town || a.village || a.municipality || a.county || d.display_name.split(',')[0];
            const country = a.country || '';
            const label = country ? `${city}, ${country}` : city;
            return { label, city, country, lat: parseFloat(d.lat), lng: parseFloat(d.lon) };
          });
        const seen = new Set();
        const unique = cities.filter((c) => {
          if (seen.has(c.label)) return false;
          seen.add(c.label);
          return true;
        });
        setResults(unique);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const handleInput = (e) => {
    const v = e.target.value;
    onChange?.(v, null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(v), 350);
  };

  const select = (item) => {
    onChange?.(item.label, item);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapRef} className="space-y-1.5 relative">
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <div className="relative">
        <HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${error ? 'border-red-300' : ''}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-[1500] top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <li key={`${r.label}-${i}`}>
              <button
                type="button"
                onClick={() => select(r)}
                className="w-full text-left px-3.5 py-2.5 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center gap-2"
              >
                <HiOutlineMapPin className="w-4 h-4 text-surface-400 flex-shrink-0" />
                <span className="truncate">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
