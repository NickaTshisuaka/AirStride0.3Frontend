// src/components/Navbar/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useFavoritesContext } from "../../src/contexts/FavoritesContext";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useAuth();
  const { favorites } = useFavoritesContext();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [cartAnimate, setCartAnimate] = useState(false);

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favAnimate, setFavAnimate] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [navSearch, setNavSearch] = useState("");

  // Set user name
  useEffect(() => {
    if (user?.displayName) {
      setFirstName(user.displayName);
    } else {
      const storedName = localStorage.getItem("firstName");
      if (storedName) {
        setFirstName(storedName);
      } else if (user?.email) {
        setFirstName(user.email.split("@")[0]);
      }
    }
  }, [user]);

  // Listen for cart updates
  useEffect(() => {
    const updateCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalQuantity = savedCart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      setCartCount(totalQuantity);

      setCartAnimate(true);
      setTimeout(() => setCartAnimate(false), 450);
    };

    updateCart(); // Initial load
    window.addEventListener("cartUpdated", updateCart);

    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  // Listen for favorites updates
  useEffect(() => {
    const updateFavorites = () => {
      const savedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      setFavoritesCount(savedFavorites.length);

      setFavAnimate(true);
      setTimeout(() => setFavAnimate(false), 450);
    };

    updateFavorites(); // Initial load
    window.addEventListener("favoritesUpdated", updateFavorites);

    return () =>
      window.removeEventListener("favoritesUpdated", updateFavorites);
  }, []);

  const showSearch = location.pathname === "/products";

  return (
    //     <header className="navbar-container">
    //       <div className="navbar-top">
    //         <div className="top-left">
    //           <Link to="/find-store" className="nav-link">Find a Store</Link>
    //           <span className="divider">|</span>
    //           <Link to="/FAQ" className="nav-link">Help</Link>
    //         </div>

    //         <div className="top-right">
    //           {firstName ? <span className="nav-link">Hi, {firstName}</span> :
    //             <Link to="/signinlogin" className="nav-link">Sign In</Link>}
    //           <Link to="/account" className="nav-icon">
    //             <i className="fas fa-user"></i>
    //           </Link>
    //         </div>
    //       </div>

    //       <div className="navbar-main">
    //         <Link to="/home" className="logo">
    //           <img src="/logo.ico" alt="AirStride Logo" />
    //         </Link>

    //         <nav className="nav-links">
    //           <Link to="/home">Home</Link>
    //           <Link to="/products">Products</Link>
    //           <Link to="/past-purchases">Past Purchases</Link>
    //           <Link to="/FAQ">FAQs</Link>
    //           <Link to="/About">About Us</Link>
    //           <Link to="/account">Account Settings</Link>
    //           <Link to="/logout">Logout</Link>
    //         </nav>

    //         <div className="nav-actions">
    //           {showSearch && (
    //             <div className="search-bar">
    //               <i className="fas fa-search"></i>
    //               <input
    //                 type="text"
    //                 value={navSearch}
    //                 placeholder="Search products..."
    //                 onChange={(e) => {
    //                   setNavSearch(e.target.value);
    //                   window.dispatchEvent(
    //                     new CustomEvent("productSearch", { detail: e.target.value })
    //                   );
    //                 }}
    //               />
    //             </div>
    //           )}

    //           {/* Favorites Icon */}
    //           <Link to="/favorites" className={`nav-icon ${favAnimate ? "fav-bounce" : ""}`}>
    //             <i className="far fa-heart"></i>
    //             {favoritesCount > 0 && <span className="fav-count">{favoritesCount}</span>}
    //           </Link>

    //           {/* Cart Icon */}
    //           <div className="cart-container">
    //             <Link to="/cart" className={`nav-icon ${cartAnimate ? "cart-bounce" : ""}`}>
    //               <i className="fas fa-shopping-cart"></i>
    //             </Link>
    //             {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
    //           </div>
    //         </div>
    //       </div>
    //     </header>

    <header className="navbar-container">

      <div className="navbar-top">
        <div className="top-left">
          <Link to="/find-store" className="top-nav-link">Find a Store</Link>
          <span className="divider">|</span>
          <Link to="/FAQ" className="top-nav-link">Help</Link>
        </div>

        <div className="user-menu">
            {firstName ? (
              <Link to="/account" className="nav-link user-greeting" title="Account Settings">Hi, {firstName}</Link>
            ) : (
              <Link to="/signinlogin" className="nav-icon" title="Sign In"><i className="fas fa-user"></i></Link>
            )}
          </div>
      </div>

      <div className="navbar-main">
        <Link to="/home" className="logo-brand-container">
          <img src="/logo.ico" alt="AirStride Logo" className="logo-img" />
          <span className="brand-title">AIRSTRIDE</span>
        </Link>

        <nav className="nav-links">
          <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link>
          
          <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>Products</Link>

          <Link to="/About" className={location.pathname === "/About" ? "active" : ""}>About Us</Link>
          <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact Us</Link>
        </nav>

        <div className="nav-actions">
          {showSearch && (
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" value={navSearch} placeholder="Search products..." onChange={(e) => {setNavSearch(e.target.value);
                  window.dispatchEvent(
                    new CustomEvent("productSearch", {
                      detail: e.target.value,
                    }),
                  );
                }}
              />
            </div>
          )}

          <Link to="/favorites" className={`nav-icon ${favAnimate ? "fav-bounce" : ""}`} title="Favorites">
            <i className="far fa-heart"></i>
            {favoritesCount > 0 && (<span className="fav-count">{favoritesCount}</span> )}
          </Link>

          <div className="cart-container">
            <Link to="/cart" className={`nav-icon ${cartAnimate ? "cart-bounce" : ""}`}title="Cart">
              <i className="fas fa-shopping-cart"></i>
            </Link>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
