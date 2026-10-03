import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../contexts/CartContext";
import { useFavoritesContext } from "../../contexts/FavoritesContext";
import "./Cart.css";

const SHIPPING_COST = 85;
const VAT_RATE = 0.15;

const formatZAR = (amount = 0) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(amount) || 0);

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart = [],
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCartContext();

  const {
    favorites = [],
    addFavorite,
    removeFavorite,
  } = useFavoritesContext();

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + (Number(item.quantity) || 1),
        0
      ),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 1),
        0
      ),
    [cart]
  );

  const vat = useMemo(
    () => subtotal * VAT_RATE,
    [subtotal]
  );

  const total = useMemo(
    () => subtotal + vat + SHIPPING_COST,
    [subtotal, vat]
  );

  const isFavorite = (productId) =>
    favorites.some(
      (favorite) =>
        String(favorite.product_id) === String(productId)
    );

  const getProductImage = (item) =>
    item.image ||
    item.imageurl ||
    item.imageUrl ||
    item.image_url ||
    "https://placehold.co/600x600?text=AirStride";

  const getQuantity = (item) =>
    Math.max(1, Number(item.quantity) || 1);

  const getStock = (item) =>
    Math.max(0, Number(item.inventory_count) || 0);

  const increaseQuantity = (item) => {
    const quantity = getQuantity(item);
    const stock = getStock(item);

    if (stock > 0 && quantity >= stock) return;

    updateQuantity(item.product_id, quantity + 1);
  };

  const decreaseQuantity = (item) => {
    const quantity = getQuantity(item);

    if (quantity <= 1) return;

    updateQuantity(item.product_id, quantity - 1);
  };

  const handleClearCart = () => {
    if (!cart.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (confirmed) {
      clearCart();
    }
  };

  return (
    <main className="cart-page">
      <section className="cart-header">
        <div>
          <span className="cart-eyebrow">AIRSTRIDE STORE</span>
          <h1>Your Cart</h1>
          <p>
            Review your items before continuing to checkout.
          </p>
        </div>

        {cart.length > 0 && (
          <div className="cart-count">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </div>
        )}
      </section>

      {cart.length === 0 ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>
            You haven't added anything to your cart yet.
            Explore our products and find something you'll love.
          </p>

          <button
            className="cart-primary-btn empty-shop-btn"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items">
            <div className="cart-section-heading">
              <h2>Cart Items</h2>

              <button
                className="clear-cart-link"
                onClick={handleClearCart}
              >
                Clear cart
              </button>
            </div>

            {cart.map((item) => {
              const quantity = getQuantity(item);
              const stock = getStock(item);
              const favorite = isFavorite(item.product_id);
              const image = getProductImage(item);
              const itemTotal =
                (Number(item.price) || 0) * quantity;

              return (
                <article
                  className="cart-item"
                  key={item.product_id}
                >
                  <div
                    className="cart-product-image"
                    onClick={() =>
                      navigate(`/product/${item.product_id}`)
                    }
                  >
                    <img
                      src={image}
                      alt={item.name || "AirStride product"}
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/600x600?text=AirStride";
                      }}
                    />
                  </div>

                  <div className="cart-product-info">
                    <div className="cart-product-top">
                      <div>
                        <span className="product-brand">
                          {item.brand || "AIRSTRIDE"}
                        </span>

                        <h3>{item.name}</h3>
                      </div>

                      <button
                        className={`favorite-btn ${
                          favorite ? "favorite-active" : ""
                        }`}
                        onClick={() =>
                          favorite
                            ? removeFavorite(item.product_id)
                            : addFavorite(item)
                        }
                        aria-label={
                          favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {favorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <p className="cart-product-description">
                      {item.description ||
                        "Quality AirStride product designed for your active lifestyle."}
                    </p>

                    <div className="cart-product-meta">
                      <span>
                        {formatZAR(item.price)}
                      </span>

                      {stock > 0 ? (
                        <span className="stock-status">
                          {stock} available
                        </span>
                      ) : (
                        <span className="stock-status out">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="cart-product-actions">
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            decreaseQuantity(item)
                          }
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          onClick={() =>
                            increaseQuantity(item)
                          }
                          disabled={
                            stock > 0 && quantity >= stock
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-product"
                        onClick={() =>
                          removeFromCart(item.product_id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <span>Item total</span>
                    <strong>{formatZAR(itemTotal)}</strong>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <div className="summary-header">
              <span>ORDER SUMMARY</span>
              <h2>Checkout</h2>
            </div>

            <div className="summary-lines">
              <div className="summary-line">
                <span>
                  Subtotal ({totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"})
                </span>
                <strong>{formatZAR(subtotal)}</strong>
              </div>

              <div className="summary-line">
                <span>VAT (15%)</span>
                <strong>{formatZAR(vat)}</strong>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <strong>{formatZAR(SHIPPING_COST)}</strong>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatZAR(total)}</strong>
            </div>

            <button
              className="cart-primary-btn checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
              <span>→</span>
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/products")}
            >
              ← Continue Shopping
            </button>

            <div className="secure-checkout">
              <span>🔒</span>
              <div>
                <strong>Secure checkout</strong>
                <p>Your order details are protected.</p>
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
};

export default Cart;