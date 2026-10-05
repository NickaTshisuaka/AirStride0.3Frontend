import React, { useEffect, useState } from "react";
import { useFavoritesContext } from "../../contexts/FavoritesContext";
import { useCartContext } from "../../contexts/CartContext";
import { ShoppingCart, Heart } from "lucide-react";
import "./Favorites.css";

const Favorites = () => {
  const { favorites, removeFavorite } = useFavoritesContext();
  const { addToCart, cart } = useCartContext();

  const [toastMessage, setToastMessage] = useState("");

  // ---------------------------------------------
  // CHECK IF PRODUCT IS IN CART
  // ---------------------------------------------
 const getProductId = (item) =>
  String(item.product_id ?? item._id ?? item.id ?? "");

const isInCart = (id) =>
  cart.some((item) => getProductId(item) === String(id));

  // ---------------------------------------------
  // ADD TO CART
  // ---------------------------------------------
  const handleAddToCart = (item) => {
   const alreadyInCart = isInCart(getProductId(item));

    if (alreadyInCart) {
      setToastMessage(
        `${item.name} is already in cart`
      );
      return;
    }

    addToCart(item);

    setToastMessage(
      `${item.name} added to cart 🛒`
    );
  };

  // ---------------------------------------------
  // REMOVE FAVORITE
  // ---------------------------------------------
  const handleRemoveFavorite = (id, name) => {
    removeFavorite(id);

    setToastMessage(
      `${name} removed from favorites ❤️`
    );
  };

  // ---------------------------------------------
  // AUTO-HIDE TOAST
  // ---------------------------------------------
  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  return (
    <main className="favorites-page">
      <h2>
        <Heart
          size={28}
          fill="currentColor"
          aria-hidden="true"
        />{" "}
        Your Favorites
      </h2>

      {favorites.length === 0 ? (
        <div className="no-favorites">
          <Heart
            size={50}
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <p>
            No favorites yet. Browse products to add
            some!
          </p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((item) => {
            const productInCart = isInCart(
              getProductId(item)
            );

            const price = Number(item.price) || 0;

            const image =
            item.imageUrl ||
              "https://placehold.co/300x300?text=No+Image";

            return (
              <article
                key={getProductId(item)}
                className="favorite-card"
              >
                {/* PRODUCT IMAGE */}
                <img
                  src={image}
                  alt={item.name}
                  className="favorite-img"
                  loading="lazy"
                />

                {/* PRODUCT NAME */}
                <h3 className="favorite-name">
                  {item.name}
                </h3>

                {/* PRODUCT PRICE */}
                <p className="favorite-price">
                  R{price.toFixed(2)}
                </p>

                {/* ACTION BUTTONS */}
                <div className="favorite-buttons">
                  <button
                    type="button"
                    className="btn remove-fav-btn"
                    onClick={() =>
                      handleRemoveFavorite(
                     getProductId(item),
                      item.name
                    )
                    }
                    aria-label={`Remove ${item.name} from favorites`}
                  >
                    <Heart
                      size={17}
                      fill="currentColor"
                      aria-hidden="true"
                    />

                    Remove
                  </button>

                  <button
                    type="button"
                    className={`btn add-cart-btn ${
                      productInCart ? "in-cart" : ""
                    }`}
                    onClick={() =>
                      handleAddToCart(item)
                    }
                    disabled={productInCart}
                    aria-label={
                      productInCart
                        ? `${item.name} is already in cart`
                        : `Add ${item.name} to cart`
                    }
                  >
                    <ShoppingCart
                      size={17}
                      aria-hidden="true"
                    />

                    {productInCart
                      ? "In Cart"
                      : "Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div
          className="toast"
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
};

export default Favorites;
