// back-end/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { CartProvider } from "./contexts/CartContext";
import GlobalProvider from "../src/contexts/GlobalProvider.jsx";
import Footer from "./components/Footer/Footer.jsx";

// Pages
import Home from "./pages/Home/Home.jsx";
import SigninLogin from "./pages/SigninLogin/SigninLogin.jsx";
import FindStore from "./pages/FindStore/FindStore.jsx";
import Products from "./pages/Products/Products.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import ProductDetail from "./pages/ProductDetail/ProductDetail.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import PastPurchases from "./pages/PastPurchases/PastPurchases.jsx";
import FAQ from "./pages/FAQ/FAQ.jsx";
import About from "./pages/About/About.jsx";
import Account from "./pages/Account/AccountSettings.jsx";
import Logout from "./pages/Logout/Logout.jsx";
import Favorites from "./pages/Favorites/Favorites.jsx";

// ========================
// Inline Route Guards (fixed)
// ========================
const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  // Wait while Firebase loads the user (prevents instant redirect)
  if (loading) return <div />;

  return currentUser ? <Outlet /> : <Navigate to="/signinlogin" replace />;
};

const PublicRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div />;

  return currentUser ? <Navigate to="/home" replace /> : <Outlet />;
};


// ========================
// Main AppContent Component
// ========================
const AppContent = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Hide navbar only on signin/login page
  const hideNavbarRoutes = ["/signinlogin"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <div style={{ paddingTop: shouldShowNavbar ? "2px" : "0" }}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/signinlogin" element={<SigninLogin />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/past-purchases" element={<PastPurchases />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/account" element={<Account />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/find-store" element={<FindStore />} />
          </Route>

          {/* Default Redirects */}
          <Route
            path="/"
            element={
              <Navigate
                to={currentUser ? "/home" : "/signinlogin"}
                replace
              />
            }
          />
          <Route path="*" element={<div></div>} />

        </Routes>
      </div>
    </>
  );
};

// ========================
// Root App Component
// ========================
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
                <GlobalProvider>
            <div className="App">
              <AppContent />
            </div>
            <Footer />
                </GlobalProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
