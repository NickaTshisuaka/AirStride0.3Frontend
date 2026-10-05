import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to load cart:", error);
    return [];
  }
};

// Keep all product IDs consistent
const normalizeId = (item) =>
  String(item.product_id ?? item._id ?? item.id ?? "");

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const id = normalizeId(action.item);

      if (!id) {
        console.error("Cannot add product without an ID");
        return state;
      }

      const exists = state.find((item) => normalizeId(item) === id);

      if (exists) {
        return state.map((item) =>
          normalizeId(item) === id
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [
        ...state,
        {
          ...action.item,
          product_id: id,
          quantity: 1,
        },
      ];
    }

    case "REMOVE":
      return state.filter(
        (item) => normalizeId(item) !== String(action.id)
      );

    case "UPDATE_QTY": {
      const quantity = Number(action.qty);

      if (!Number.isFinite(quantity) || quantity < 1) {
        return state;
      }

      return state.map((item) =>
        normalizeId(item) === String(action.id)
          ? {
              ...item,
              quantity: Math.floor(quantity),
            }
          : item
      );
    }

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, getInitialCart);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

    // Notify Navbar and other components
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  const addToCart = (item) => {
    dispatch({
      type: "ADD",
      item,
    });
  };

  const removeFromCart = (id) => {
    dispatch({
      type: "REMOVE",
      id,
    });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({
      type: "UPDATE_QTY",
      id,
      qty: quantity,
    });
  };

  const clearCart = () => {
    dispatch({
      type: "CLEAR",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export const useCartContext = () => useContext(CartContext);
