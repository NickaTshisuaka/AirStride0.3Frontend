
// src/pages/Products/Products.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Heart,
  Search,
  SlidersHorizontal,
  Package,
  X,
} from "lucide-react";
import { useCartContext } from "../../contexts/CartContext";
import { useFavoritesContext } from "../../contexts/FavoritesContext";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const BASE_API_URL = import.meta.env.VITE_API_URL;

const CACHE_LIFETIME = 1000 * 60 * 60 * 2;

const Products = () => {
  const { cart, addToCart } = useCartContext();
  const { favorites, addFavorite, removeFavorite } = useFavoritesContext();
  const { idToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  /* =========================
     NORMALIZE PRODUCT
  ========================= */

  const normalizeProduct = (p) => ({
    ...p,

    product_id:
      p.product_id ??
      p._id ??
      p.id,

    name:
      p.name ??
      p.product_name ??
      "Unnamed Product",

    category:
      p.category ??
      p.category_name ??
      `Category ${p.category_id ?? ""}`,

    price: Number(p.price ?? 0),

    inventory_count: Number(
      p.inventory_count ??
      p.stock ??
      0
    ),

    imageUrl:
      p.imageurl ??
      p.imageUrl ??
      p.image ??
      p.image_url ??
      "",

    description:
      p.description ??
      "Quality AirStride product designed for your active lifestyle.",

    brand:
      p.brand ??
      "AirStride",

    material:
      p.material ??
      "",

    tags:
      Array.isArray(p.tags)
        ? p.tags
        : [],
  });

  /* =========================
     CACHE
  ========================= */

  const loadFromCache = () => {
    try {
      const cached = JSON.parse(
        localStorage.getItem("products_cache")
      );

      if (!cached) return null;

      const expired =
        Date.now() - cached.timestamp > CACHE_LIFETIME;

      if (expired) {
        localStorage.removeItem("products_cache");
        return null;
      }

      return cached.products;
    } catch {
      return null;
    }
  };

  const saveToCache = (items) => {
    try {
      localStorage.setItem(
        "products_cache",
        JSON.stringify({
          timestamp: Date.now(),
          products: items,
        })
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  /* =========================
     FETCH PRODUCTS
  ========================= */

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;

    const cachedProducts = loadFromCache();

    if (cachedProducts?.length) {
      setProducts(cachedProducts);
      setLoading(false);
    }

    const fetchProducts = async () => {
      try {
        setError("");

        const headers = idToken
          ? {
              Authorization: `Bearer ${idToken}`,
            }
          : {};

        const baseUrl =
          BASE_API_URL?.replace(/\/$/, "");

        if (!baseUrl) {
          throw new Error(
            "VITE_API_URL is not configured."
          );
        }

        const response = await axios.get(
          `${baseUrl}/api/products`,
          {
            headers,
            timeout: 15000,
          }
        );

        console.log("Products API response:", response.data);

        const rawProducts = Array.isArray(response.data)
          ? response.data
          : response.data?.products ??
            response.data?.data ??
            response.data?.rows ??
            [];

        if (!Array.isArray(rawProducts)) {
          throw new Error(
            "The API returned an unexpected product format."
          );
        }

        const normalized = rawProducts
          .map(normalizeProduct)
          .filter((product) => product.product_id);

        if (mounted) {
          setProducts(normalized);
          saveToCache(normalized);

          if (!normalized.length) {
            setError(
              "The API responded successfully, but no products were returned."
            );
          }
        }
      } catch (err) {
        console.error("Product fetch error:", err);

        if (!mounted) return;

        if (!cachedProducts?.length) {
          setProducts([]);

          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [idToken, authLoading]);

  /* =========================
     NAVBAR SEARCH
  ========================= */

  useEffect(() => {
    const handleSearch = (event) => {
      setSearchTerm(event.detail || "");
    };

    window.addEventListener(
      "productSearch",
      handleSearch
    );

    return () => {
      window.removeEventListener(
        "productSearch",
        handleSearch
      );
    };
  }, []);

  /* =========================
     CATEGORIES
  ========================= */

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [products]);

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredProducts = useMemo(() => {
    const term = searchTerm
      .toLowerCase()
      .trim();

    let result = products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name
          .toLowerCase()
          .includes(term) ||
        product.category
          .toLowerCase()
          .includes(term) ||
        product.brand
          .toLowerCase()
          .includes(term);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortBy,
  ]);

  /* =========================
     HELPERS
  ========================= */

  const isInCart = (id) =>
    cart.some(
      (item) =>
        item.product_id === id
    );

  const isFavorite = (id) =>
    favorites.some(
      (item) =>
        item.product_id === id
    );

  const handleAddToCart = (product) => {
    if (product.inventory_count < 1) {
      setToastMessage(
        `${product.name} is out of stock`
      );
      return;
    }

    if (isInCart(product.product_id)) {
      setToastMessage(
        `${product.name} is already in your cart`
      );
      return;
    }

    addToCart(product);

    setToastMessage(
      `${product.name} added to cart`
    );
  };

  const handleToggleFavorite = (product) => {
    if (isFavorite(product.product_id)) {
      removeFavorite(product.product_id);

      setToastMessage(
        `${product.name} removed from favorites`
      );
    } else {
      addFavorite(product);

      setToastMessage(
        `${product.name} added to favorites`
      );
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  /* =========================
     TOAST
  ========================= */

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  /* =========================
     RENDER
  ========================= */

  return (
    <main className="products-page">

      {/* HERO */}

      <section className="products-hero">
        <div className="hero-content">
          <span className="hero-label">
            AIRSTRIDE STORE
          </span>

          <h1>
            Move Better.
            <span> Live Better.</span>
          </h1>

          <p>
            Explore our collection of performance
            footwear, fitness equipment and
            active lifestyle products.
          </p>

          <div className="hero-stat">
            <Package size={18} />
            <span>
              {products.length} products available
            </span>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}

      <section className="products-toolbar">

        <div className="product-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <div className="category-filter">
            <SlidersHorizontal size={17} />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <select
            className="sort-filter"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="default">
              Sort: Featured
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="name">
              Name: A-Z
            </option>
          </select>
        </div>
      </section>

      {/* RESULT COUNT */}

      {!loading && !error && (
        <div className="results-row">
          <span>
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            products
          </span>

          {(searchTerm ||
            selectedCategory !== "All") && (
            <button onClick={clearSearch}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="products-error">
          <Package size={35} />

          <h2>Products couldn't be loaded</h2>

          <p>{error}</p>

          <small>
            Check that your VITE_API_URL points to
            your AirStride backend.
          </small>
        </div>
      )}

      {/* PRODUCTS */}

      <section className="products-grid">

        {loading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div
              className="product-card skeleton-card"
              key={index}
            >
              <div className="skeleton-image" />

              <div className="skeleton-content">
                <div className="skeleton-line small" />
                <div className="skeleton-line" />
                <div className="skeleton-line price" />
              </div>
            </div>
          ))}

        {!loading &&
          !error &&
          filteredProducts.map((product) => (
            <article
              className="product-card"
              key={product.product_id}
            >

              {/* IMAGE */}

              <div className="product-image-wrap">

                <button
                  className={`favorite-btn ${
                    isFavorite(product.product_id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleToggleFavorite(product)
                  }
                  aria-label="Toggle favorite"
                >
                  <Heart
                    size={19}
                    fill={
                      isFavorite(
                        product.product_id
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                {product.inventory_count < 1 && (
                  <span className="stock-badge">
                    Out of stock
                  </span>
                )}

                <img
                  src={
                    product.imageUrl ||
                    "https://placehold.co/700x700/f1f4f8/687386?text=AirStride"
                  }
                  alt={product.name}
                  className="product-img"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/700x700/f1f4f8/687386?text=AirStride";
                  }}
                />

              </div>

              {/* INFO */}

              <div className="product-info">

                <span className="product-category">
                  {product.category}
                </span>

                <h2>{product.name}</h2>

                <p className="product-description">
                  {product.description}
                </p>

                <div className="product-bottom">

                  <strong className="product-price">
                    R{product.price.toFixed(2)}
                  </strong>

                  {product.inventory_count > 0 && (
                    <span className="stock-count">
                      {product.inventory_count} available
                    </span>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="product-actions">

                  <button
                    className="cart-btn"
                    onClick={() =>
                      handleAddToCart(product)
                    }
                    disabled={
                      product.inventory_count < 1 ||
                      isInCart(
                        product.product_id
                      )
                    }
                  >
                    <ShoppingCart size={17} />

                    {isInCart(
                      product.product_id
                    )
                      ? "In Cart"
                      : "Add to Cart"}
                  </button>

                  <button
                    className="details-btn"
                    onClick={() =>
                      navigate(
                        `/product/${product.product_id}`
                      )
                    }
                  >
                    View
                  </button>

                </div>

              </div>
            </article>
          ))}

      </section>

      {/* EMPTY */}

      {!loading &&
        !error &&
        filteredProducts.length === 0 && (
          <div className="empty-products">

            <Search size={42} />

            <h2>No products found</h2>

            <p>
              Try another search or remove the
              selected filters.
            </p>

            <button onClick={clearSearch}>
              View all products
            </button>

          </div>
        )}

      {/* TOAST */}

      {toastMessage && (
        <div className="product-toast">
          {toastMessage}
        </div>
      )}

    </main>
  );
};

export default Products;
