import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { auth } from "../../firebase";
import "./SigninLogin.css";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SigninLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // ---------------- PHONE LOGIN STATES ----------------
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  if (!loading && currentUser) {
    return <Navigate to="/home" replace />;
  }

  // ---------------- NORMAL INPUT HANDLER ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // ---------------- NORMAL LOGIN / SIGNUP ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
    } else {
      if (
        !formData.email ||
        !formData.password ||
        !formData.firstName ||
        !formData.lastName
      ) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const userCredential = await login(formData.email, formData.password);
        const displayName =
          userCredential?.user?.displayName ||
          formData.email.split("@")[0];

        localStorage.setItem("email", formData.email);
        localStorage.setItem("firstName", displayName);

        toast.success(`🎉 Welcome back, ${displayName}!`);
        setTimeout(() => navigate("/home", { replace: true }), 800);
      } else {
        await signup(formData.email, formData.password);

        localStorage.setItem("email", formData.email);
        localStorage.setItem("firstName", formData.firstName);
        localStorage.setItem("lastName", formData.lastName);

        toast.success(`🎊 Welcome aboard, ${formData.firstName}!`);
        setTimeout(() => navigate("/home", { replace: true }), 800);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      let msg = "Authentication failed";

      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-email":
          msg = "No account found for that email";
          break;
        case "auth/wrong-password":
          msg = "Incorrect password";
          break;
        case "auth/email-already-in-use":
          msg = "Email already in use";
          break;
        case "auth/weak-password":
          msg = "Password is too weak";
          break;
        case "auth/too-many-requests":
          msg = "Too many attempts. Try again later.";
          break;
        default:
          msg = err.message;
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
    setError("");
  };

  // ---------------- SOCIAL LOGIN ----------------
  const handleSocialLogin = async (provider) => {
    setError("");
    setIsLoading(true);

    try {
      let authProvider;

      switch (provider) {
        case "Google":
          authProvider = new GoogleAuthProvider();
          break;
        case "GitHub":
          authProvider = new GithubAuthProvider();
          break;
        case "Facebook":
          authProvider = new FacebookAuthProvider();
          break;
        case "Twitter":
          authProvider = new TwitterAuthProvider();
          break;
        default:
          setError("Provider not supported");
          return;
      }

      const result = await signInWithPopup(auth, authProvider);

      localStorage.setItem("email", result.user.email);
      localStorage.setItem(
        "firstName",
        result.user.displayName || result.user.email.split("@")[0]
      );

      navigate("/home");
    } catch (err) {
      console.error("Social Login Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- PHONE LOGIN LOGIC ----------------
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier && auth) {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "normal",
          callback: () => console.log("reCAPTCHA solved"),
        },
        auth
      );
      // ONLY disable app verification for local testing
      if (isLocalhost) {
        window.recaptchaVerifier.appVerificationDisabledForTesting = true;
        console.log("Recaptcha testing mode enabled (localhost only)");
      }
    }
  };

  const sendCode = async () => {
    setError("");
    if (!phoneNumber) {
      setError("Enter a valid phone number");
      return;
    }
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmation;
      setIsOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (err) {
      console.error("Phone login error:", err);
      // Friendly error messages for production
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format");
      } else if (err.code === "auth/quota-exceeded") {
        setError("Too many requests. Try again later.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    }
  };

  const verifyCode = async () => {
    setError("");
    if (!otp) {
      setError("Enter the OTP code");
      return;
    }
    try {
      const result = await window.confirmationResult.confirm(otp);
      localStorage.setItem("phone", result.user.phoneNumber);
      localStorage.setItem("firstName", "Phone User");
      toast.success("Phone login successful!");
      navigate("/home");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Invalid OTP. Please try again.");
    }
  };

  // ---------------- UI BELOW ----------------
  return (
    <>
      <ToastContainer position="top-center" />

      <div className="auth-container gradient-bg">
        <div className='sports-video'>
   <video 
  src={`${window.location.origin}/videos/nike-innovations.mp4`} 
  autoPlay 
  loop 
  controls 
  mute
  // width="150%" 
  // height="100%"
/>
</div>
        <div className="auth-wrapper glass-card">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>{isLogin ? "Welcome Back " : "Create Account "}</h2>
              <p>{isLogin ? "Sign in to your account" : "Sign up for a new account"}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="name-row">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="auth-input"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="auth-input"
                    disabled={isLoading}
                  />
                </div>
              )}

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="auth-input"
                disabled={isLoading}
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="auth-input"
                disabled={isLoading}
              />

              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="auth-input"
                  disabled={isLoading}
                />
              )}

              {isLogin && (
                <div className="forgot-password">
                  <a href="#" className="forgot-link">Forgot your password?</a>
                </div>
              )}

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? (isLogin ? "Signing In..." : "Signing Up...") : (isLogin ? "Sign In" : "Sign Up")}
              </button>
            </form>

            {/* ---------------- PHONE LOGIN UI ---------------- */}
            <div className="phone-login-box">
              {/* <h3>Sign in with Phone</h3>

              <input
                type="text"
                placeholder="+27 65 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="auth-input"
              />

              {!isOtpSent ? (
                <button className="auth-button" onClick={sendCode} disabled={isLoading}>
                  Send OTP
                </button>
              ) : ( */}
                {/* <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="auth-input"
                  />

                  <button className="auth-button" onClick={verifyCode} disabled={isLoading}>
                    Verify OTP
                  </button>
                </>
              )} */}

              <div id="recaptcha-container" style={{ marginTop: "10px" }}></div>
            </div>

            <div className="auth-divider"><span>or continue with</span></div>

            <div className="social-login">
              {["Google", "GitHub", "Facebook", "Twitter"].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className={`social-button ${provider.toLowerCase()}`}
                  onClick={() => handleSocialLogin(provider)}
                  disabled={isLoading}
                >
                  <i className={`fab fa-${provider.toLowerCase()}`}></i>
                </button>
              ))}
            </div>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleForm} className="toggle-button" disabled={isLoading}>
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninLogin;