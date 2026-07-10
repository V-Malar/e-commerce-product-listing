import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
} from "react";
import { ShoppingCart, Heart, Search, RefreshCw, Star, X, Github } from "lucide-react";

/* ============================================================================
 * TASK 3 — Reusable custom hook for fetching API data
 * A small, generic data-fetching hook. It's deliberately unopinionated about
 * *what* it fetches (products, categories, anything JSON) so it can be reused
 * across a real app rather than being a one-off "useProducts" hook.
 * ==========================================================================*/
function useFetch(url, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const controllerRef = useRef(null);

  const run = useCallback(() => {
    if (!enabled || !url) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ data: null, loading: false, error: err.message || "Something went wrong" });
      });
  }, [url, enabled]);

  useEffect(() => {
    run();
    return () => controllerRef.current?.abort();
  }, [run]);

  return { ...state, refetch: run };
}

/* ============================================================================
 * TASK 2 — Reusable Button component with variants
 * Supports variant (primary / secondary / danger), size, loading, disabled,
 * and an optional icon. This is the only Button used anywhere in the app —
 * consistency by construction, not by convention.
 * ==========================================================================*/
const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, disabled = false, icon: Icon, children, onClick, type = "button", ...rest },
  ref
) {
  const isDisabled = disabled || loading;

  const base = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    border: "1px solid transparent",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
    opacity: isDisabled ? 0.55 : 1,
    letterSpacing: "0.01em",
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "13px" },
    md: { padding: "10px 18px", fontSize: "14px" },
    lg: { padding: "13px 24px", fontSize: "15px" },
  };

  const variants = {
    primary: {
      background: "#2F4F3D",
      color: "#F7F5F0",
      borderColor: "#2F4F3D",
      boxShadow: "0 1px 0 rgba(0,0,0,0.15)",
    },
    secondary: {
      background: "transparent",
      color: "#2F4F3D",
      borderColor: "#2F4F3D",
    },
    danger: {
      background: "#B23A2E",
      color: "#F7F5F0",
      borderColor: "#B23A2E",
      boxShadow: "0 1px 0 rgba(0,0,0,0.15)",
    },
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <RefreshCw size={size === "sm" ? 13 : 15} style={{ animation: "spin 0.8s linear infinite" }} />
      ) : (
        Icon && <Icon size={size === "sm" ? 13 : 15} />
      )}
      {children}
    </button>
  );
});

/* ============================================================================
 * Presentational bits
 * ==========================================================================*/
function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        padding: "7px 16px",
        borderRadius: "999px",
        border: `1px solid ${active ? "#2F4F3D" : "#D9D5C9"}`,
        background: active ? "#2F4F3D" : "transparent",
        color: active ? "#F7F5F0" : "#4A4A42",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 150ms ease",
        textTransform: "capitalize",
      }}
    >
      {label}
    </button>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < Math.round(rating) ? "#C99A2E" : "none"}
          color="#C99A2E"
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div style={{ border: "1px solid #E4E1D8", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
      <div style={{ height: 160, background: "linear-gradient(90deg,#eee,#f5f5f0,#eee)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "14px" }}>
        <div style={{ height: 12, width: "70%", background: "#eee", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, width: "40%", background: "#eee", borderRadius: 4 }} />
      </div>
    </div>
  );
}

function ProductCard({ product, isWishlisted, onToggleWishlist, onAddToCart }) {
  return (
    <div
      style={{
        border: "1px solid #E4E1D8",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 150ms ease, transform 150ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(27,27,24,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "relative", height: 170, background: "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <img
          src={product.image}
          alt={product.title}
          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
          loading="lazy"
        />
        <button
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%",
            border: "1px solid #E4E1D8", background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}
        >
          <Heart size={14} fill={isWishlisted ? "#B23A2E" : "none"} color={isWishlisted ? "#B23A2E" : "#4A4A42"} />
        </button>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8A8578", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {product.category}
        </span>
        <h3
          style={{
            fontFamily: "'Fraunces', serif", fontSize: "15px", fontWeight: 600, color: "#1B1B18",
            margin: 0, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {product.title}
        </h3>
        <Stars rating={product.rating?.rate || 0} />

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: 500, color: "#1B1B18",
              border: "1px dashed #C99A2E", borderRadius: "4px", padding: "3px 8px", background: "#FBF6E9",
            }}
          >
            ${product.price.toFixed(2)}
          </span>
          <Button size="sm" variant="primary" icon={ShoppingCart} onClick={() => onAddToCart(product.id)}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TASK 1 — Product listing component with category filtering
 * ==========================================================================*/
function ProductListing() {
  const { data: products, loading, error, refetch } = useFetch("https://fakestoreapi.com/products");

  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const categories = useMemo(() => {
    if (!products) return [];
    return ["all", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesQuery = p.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  const toggleWishlist = (id) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const addToCart = (id) => setCart((c) => [...c, id]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F7F5F0", minHeight: "100%", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8578", fontWeight: 600 }}>
            Practical Assignment · React Developer
          </span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 700, color: "#1B1B18", margin: "4px 0 0" }}>
            Catalog
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #E4E1D8", borderRadius: "8px", padding: "8px 14px" }}>
          <ShoppingCart size={16} color="#2F4F3D" />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B1B18" }}>{cart.length} in cart</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px", maxWidth: "360px" }}>
        <Search size={15} color="#8A8578" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          style={{
            width: "100%", padding: "9px 12px 9px 34px", borderRadius: "7px", border: "1px solid #D9D5C9",
            fontSize: "13px", fontFamily: "'Inter', sans-serif", background: "#fff", outline: "none",
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }} aria-label="Clear search">
            <X size={14} color="#8A8578" />
          </button>
        )}
      </div>

      {/* Category filter */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "18px" }}>
          {categories.map((cat) => (
            <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "10px", border: "1px solid #E4E1D8" }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", color: "#1B1B18", marginBottom: "4px" }}>Couldn't load the catalog</p>
          <p style={{ fontSize: "13px", color: "#8A8578", marginBottom: "16px" }}>{error}</p>
          <Button variant="secondary" icon={RefreshCw} onClick={refetch}>Try again</Button>
        </div>
      )}

      {/* Grid */}
      {!error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "16px" }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : visibleProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.includes(p.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart}
                />
              ))}
        </div>
      )}

      {!loading && !error && visibleProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "#8A8578", fontSize: "13px" }}>
          No products match "{query}" in this category.
        </div>
      )}

      {/* Button variant showcase (task 2 reference) */}
      <div style={{ marginTop: "36px", padding: "18px", background: "#fff", border: "1px solid #E4E1D8", borderRadius: "10px" }}>
        <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A8578", fontWeight: 600, marginBottom: "10px" }}>
          Button component — variants
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </div>
    </div>
  );
}

export default function EcommerceAssignment() {
  return <ProductListing />;
}
