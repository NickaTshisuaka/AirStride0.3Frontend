import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritesContext } from "../../contexts/FavoritesContext";
import { useCartContext } from "../../contexts/CartContext";
import { ShoppingCart, Heart, ArrowLeft, Trash2 } from "lucide-react";
import "./Favorites.css";

const formatZAR = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(amount) || 0);

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavoritesContext();
  const { addToCart, cart } = useCartContext();
  const [toastMessage, setToastMessage] = useState("");

  const isInCart = (id) =>
    cart.some((item) => String(item.product_id) === String(id));

  const getProductImage = (item) =>
    item.image ||
    item.imageurl ||
    item.imageUrl ||
    "https://placehold.co/600x600?text=AirStride";

  const handleAddToCart = (item) => {
    if (isInCart(item.product_id)) {
      setToastMessage(`${item.name} is already in your cart`);
      return;
    }

    addToCart({
      ...item,
      quantity: item.quantity || 1,
    });

    setToastMessage(`${item.name} added to your cart`);
  };

  const handleRemoveFavorite = (id, name) => {
    removeFavorite(id);
    setToastMessage(`${name} removed from favorites`);
  };

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <button
          className="back-btn"
          onClick={() => navigate("/products")}
          type="button"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>

        <div className="favorites-title">
          <span className="title-icon">
            <Heart size={24} fill="currentColor" />
          </span>
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h1>Favorites</h1>
            <p>
              {favorites.length === 0
                ? "Save your favourite AirStride products here."
                : `${favorites.length} ${
                    favorites.length === 1 ? "product" : "products"
                  } saved`}
            </p>
          </div>
        </div>
      </section>

      {favorites.length === 0 ? (
        <section className="empty-favorites">
          <div className="empty-icon">
            <Heart size={42} />
          </div>

          <h2>Your favorites are empty</h2>

          <p>
            You haven't saved any products yet. Find something you love and
            tap the heart to save it here.
          </p>

          <button
            className="shop-btn"
            onClick={() => navigate("/products")}
            type="button"
          >
            Browse Products
          </button>
        </section>
      ) : (
        <section className="favorites-grid">
          {favorites.map((item) => {
            const inCart = isInCart(item.product_id);

            return (
              <article
                key={item.product_id}
                className="favorite-card"
              >
                <div
                  className="favorite-image-wrap"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="favorite-img"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x600?text=AirStride";
                    }}
                  />

                  <button
                    className="heart-btn"
                    type="button"
                    aria-label={`Remove ${item.name} from favorites`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(item.product_id, item.name);
                    }}
                  >
                    <Heart size={19} fill="currentColor" />
                  </button>
                </div>

                <div className="favorite-content">
                  {item.brand && (
                    <span className="favorite-brand">{item.brand}</span>
                  )}

                  <h2
                    className="favorite-name"
                    onClick={() =>
                      navigate(`/product/${item.product_id}`)
                    }
                  >
                    {item.name}
                  </h2>

                  {item.description && (
                    <p className="favorite-description">
                      {item.description}
                    </p>
                  )}

                  <div className="favorite-bottom">
                    <span className="favorite-price">
                      {formatZAR(item.price)}
                    </span>

                    {item.inventory_count !== undefined && (
                      <span
                        className={
                          Number(item.inventory_count) > 0
                            ? "stock available"
                            : "stock unavailable"
                        }
                      >
                        {Number(item.inventory_count) > 0
                          ? "In stock"
                          : "Out of stock"}
                      </span>
                    )}
                  </div>

                  <div className="favorite-actions">
                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() =>
                        handleRemoveFavorite(
                          item.product_id,
                          item.name
                        )
                      }
                    >
                      <Trash2 size={17} />
                      Remove
                    </button>

                    <button
                      className={`cart-btn ${
                        inCart ? "in-cart" : ""
                      }`}
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={inCart}
                    >
                      <ShoppingCart size={17} />
                      {inCart ? "In Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {toastMessage && (
        <div className="favorite-toast" role="status">
          {toastMessage}
        </div>
      )}
    </main>
  );
};

export default Favorites;