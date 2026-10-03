// src/pages/AccountSettings/AccountSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Upload,
  Trash2,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Check,
  X,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Confetti from "react-confetti";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { useTheme } from "../../contexts/ThemeContext";
import "react-toastify/dist/ReactToastify.css";
import "./AccountSettings.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const DEFAULT_NOTIFICATIONS = {
  email: true,
  inApp: true,
  push: false,
};

const AccountSettings = () => {
  const {
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
  } = useTheme();

  const storedEmail = localStorage.getItem("email") || "";

  const [user, setUser] = useState({
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    email: storedEmail,
    phone: localStorage.getItem("phone") || "",
    address: localStorage.getItem("address") || "",
    profileImg: localStorage.getItem("profileImg") || "",
  });

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("profile");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwUpdating, setPwUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("airstrideNotifications") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return {
        ...DEFAULT_NOTIFICATIONS,
        ...JSON.parse(
          localStorage.getItem("airstrideNotificationPrefs") || "{}"
        ),
      };
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const initials = useMemo(() => {
    const first = user.firstName?.charAt(0) || "?";
    const last = user.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  }, [user.firstName, user.lastName]);

  const passwordStrength = (password) => {
    if (!password) {
      return {
        label: "",
        color: "",
        score: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak",
        color: "weak",
        score,
      };
    }

    if (score === 2) {
      return {
        label: "Medium",
        color: "medium",
        score,
      };
    }

    return {
      label: "Strong",
      color: "strong",
      score,
    };
  };

  const strength = passwordStrength(newPassword);

  const triggerAlert = (type, message) => {
    const messages = {
      welcome: message || `Welcome back, ${user.firstName || "User"}!`,
      profileSaved: message || "Profile saved successfully.",
      passwordUpdated: message || "Password updated successfully.",
      payment: message || "Payment successful.",
    };

    const notifMsg = messages[type] || message || "Notification";

    if (type === "profileSaved" || type === "passwordUpdated") {
      toast.success(notifMsg);
    } else if (type === "payment") {
      toast.success(notifMsg);

      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } else {
      toast.info(notifMsg);
    }

    if (notifPrefs.inApp) {
      const newNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        message: notifMsg,
        read: false,
        date: new Date().toISOString(),
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 50);

        localStorage.setItem(
          "airstrideNotifications",
          JSON.stringify(updated)
        );

        return updated;
      });
    }
  };

  useEffect(() => {
    localStorage.setItem(
      "airstrideNotificationPrefs",
      JSON.stringify(notifPrefs)
    );
  }, [notifPrefs]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!storedEmail) {
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/api/users/email/${encodeURIComponent(storedEmail)}`
        );

        if (!res.ok) {
          throw new Error("Unable to load your profile.");
        }

        const data = await res.json();

        const profile = {
          firstName:
            data.firstName ||
            localStorage.getItem("firstName") ||
            "",
          lastName:
            data.lastName ||
            localStorage.getItem("lastName") ||
            "",
          email: data.email || storedEmail,
          phone:
            data.phone ||
            localStorage.getItem("phone") ||
            "",
          address:
            data.address ||
            localStorage.getItem("address") ||
            "",
          profileImg:
            data.profileImg ||
            localStorage.getItem("profileImg") ||
            "",
        };

        setUser(profile);

        localStorage.setItem("firstName", profile.firstName);
        localStorage.setItem("lastName", profile.lastName);
        localStorage.setItem("email", profile.email);
        localStorage.setItem("phone", profile.phone);
        localStorage.setItem("address", profile.address);
        localStorage.setItem("profileImg", profile.profileImg);

        if (!sessionStorage.getItem("airstrideWelcomeShown")) {
          toast.info(`Welcome back, ${profile.firstName || "User"}!`);
          sessionStorage.setItem("airstrideWelcomeShown", "true");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [storedEmail]);

  const updateField = (field, value) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImg = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile images must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const image = e.target?.result;

      if (typeof image !== "string") return;

      updateField("profileImg", image);
      localStorage.setItem("profileImg", image);

      toast.success("Profile image updated.");
    };

    reader.onerror = () => {
      toast.error("Unable to read the image.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeImg = () => {
    updateField("profileImg", "");
    localStorage.removeItem("profileImg");
    toast.info("Profile image removed.");
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!user.firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    if (!user.lastName.trim()) {
      toast.error("Last name is required.");
      return;
    }

    if (!user.email.trim()) {
      toast.error("No account email was found.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        phone: user.phone.trim(),
        address: user.address.trim(),
        profileImg: user.profileImg || "",
      };

      const res = await fetch(
        `${API_URL}/api/users/email/${encodeURIComponent(user.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      localStorage.setItem("firstName", payload.firstName);
      localStorage.setItem("lastName", payload.lastName);
      localStorage.setItem("phone", payload.phone);
      localStorage.setItem("address", payload.address);
      localStorage.setItem("profileImg", payload.profileImg);

      setUser((prev) => ({
        ...prev,
        ...payload,
      }));

      triggerAlert("profileSaved");
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error(error.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    if (!auth?.currentUser) {
      toast.error(
        "No Firebase account is currently signed in. Please sign in again."
      );
      return;
    }

    if (!currentPassword) {
      toast.error("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (strength.label === "Weak") {
      toast.error(
        "Choose a stronger password using uppercase letters, numbers and symbols."
      );
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Your new password must be different.");
      return;
    }

    setPwUpdating(true);

    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser.email) {
        throw new Error("Your Firebase account has no email address.");
      }

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(
        firebaseUser,
        credential
      );

      await updatePassword(firebaseUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      triggerAlert("passwordUpdated");
    } catch (error) {
      console.error("Password update error:", error);

      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          toast.error("Current password is incorrect.");
          break;

        case "auth/weak-password":
          toast.error("The new password is too weak.");
          break;

        case "auth/requires-recent-login":
          toast.error(
            "Please sign out and sign in again before changing your password."
          );
          break;

        case "auth/too-many-requests":
          toast.error(
            "Too many attempts. Please wait and try again later."
          );
          break;

        default:
          toast.error(
            error?.message || "Failed to update your password."
          );
      }
    } finally {
      setPwUpdating(false);
    }
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      );

      localStorage.setItem(
        "airstrideNotifications",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("airstrideNotifications");
    toast.info("Notifications cleared.");
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "password",
      label: "Security",
      icon: Lock,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadCount,
    },
    {
      id: "theme",
      label: "Theme",
      icon: theme === "dark" ? Sun : Moon,
    },
  ];

  const renderProfileTab = () => (
    <section className="account-card">
      <div className="account-card-head">
        <div>
          <span className="account-kicker">ACCOUNT</span>
          <h1>Profile Information</h1>
          <p>Manage your personal information and profile picture.</p>
        </div>
      </div>

      <div className="profile-box">
        <div className="profile-pic">
          {user.profileImg ? (
            <img
              src={user.profileImg}
              alt={`${user.firstName} profile`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="profile-actions">
          <div>
            <strong>
              {user.firstName || "Your"} {user.lastName}
            </strong>
            <span>{user.email || "No email available"}</span>
          </div>

          <div className="pic-btns">
            <label className="account-btn account-btn-primary">
              <Upload size={15} />
              Upload
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={uploadImg}
              />
            </label>

            {user.profileImg && (
              <button
                className="account-btn account-btn-danger"
                type="button"
                onClick={removeImg}
              >
                <Trash2 size={15} />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <form className="account-form" onSubmit={saveProfile}>
        <div className="account-row">
          <div className="account-field">
            <label>First Name</label>
            <input
              type="text"
              value={user.firstName}
              onChange={(event) =>
                updateField("firstName", event.target.value)
              }
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>

          <div className="account-field">
            <label>Last Name</label>
            <input
              type="text"
              value={user.lastName}
              onChange={(event) =>
                updateField("lastName", event.target.value)
              }
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="account-row">
          <div className="account-field">
            <label>Email Address</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="account-readonly"
              autoComplete="email"
            />
            <small>Your account email cannot be changed here.</small>
          </div>

          <div className="account-field">
            <label>Phone Number</label>
            <input
              type="tel"
              value={user.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              placeholder="+27 ..."
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="account-field">
          <label>Address</label>
          <input
            type="text"
            value={user.address}
            onChange={(event) =>
              updateField("address", event.target.value)
            }
            placeholder="Your delivery address"
            autoComplete="street-address"
          />
        </div>

        <div className="account-form-footer">
          <span className="account-save-info">
            <ShieldCheck size={16} />
            Your information is stored securely.
          </span>

          <button
            className="save-btn"
            type="submit"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );

  const renderPasswordTab = () => (
    <section className="account-card">
      <div className="account-card-head">
        <div>
          <span className="account-kicker">SECURITY</span>
          <h1>Password Settings</h1>
          <p>
            Change your password and keep your AirStride account secure.
          </p>
        </div>
      </div>

      <div className="security-banner">
        <ShieldCheck size={22} />
        <div>
          <strong>Password protection</strong>
          <span>
            You will need your current password before a new one can be
            applied.
          </span>
        </div>
      </div>

      <form
        className="account-form password-form"
        onSubmit={changePassword}
      >
        <div className="account-field">
          <label>Current Password</label>

          <div className="password-wrap">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              placeholder="Enter current password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrent((value) => !value)}
              aria-label={
                showCurrent
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              {showCurrent ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="account-field">
          <label>New Password</label>

          <div className="password-wrap">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNew((value) => !value)}
              aria-label={
                showNew
                  ? "Hide new password"
                  : "Show new password"
              }
            >
              {showNew ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {newPassword && (
            <div className="password-strength">
              <div className="strength-track">
                <div
                  className={`strength-fill ${strength.color}`}
                  style={{
                    width:
                      strength.score === 1
                        ? "25%"
                        : strength.score === 2
                        ? "50%"
                        : strength.score === 3
                        ? "75%"
                        : "100%",
                  }}
                />
              </div>

              <span className={`strength-text ${strength.color}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className="account-field">
          <label>Confirm New Password</label>

          <div className="password-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Repeat your new password"
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={
                showConfirm
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
            >
              {showConfirm ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {confirmPassword && (
            <div
              className={`password-match ${
                newPassword === confirmPassword
                  ? "match-ok"
                  : "match-error"
              }`}
            >
              {newPassword === confirmPassword ? (
                <>
                  <Check size={15} />
                  Passwords match
                </>
              ) : (
                <>
                  <X size={15} />
                  Passwords do not match
                </>
              )}
            </div>
          )}
        </div>

        <div className="account-form-footer">
          <span className="account-save-info">
            Use at least 8 characters with numbers and symbols.
          </span>

          <button
            className="save-btn"
            type="submit"
            disabled={pwUpdating}
          >
            <Lock size={16} />
            {pwUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );

  const renderAlertsTab = () => (
    <section className="account-card">
      <div className="account-card-head alert-head">
        <div>
          <span className="account-kicker">ALERTS</span>
          <h1>Notifications</h1>
          <p>Control how AirStride keeps you updated.</p>
        </div>

        {notifications.length > 0 && (
          <button
            className="clear-notifications"
            onClick={clearNotifications}
            type="button"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="notification-preferences">
        <h3>Notification Preferences</h3>

        <label className="notification-option">
          <span>
            <strong>Email</strong>
            <small>Receive updates by email.</small>
          </span>

          <input
            type="checkbox"
            checked={notifPrefs.email}
            onChange={() =>
              setNotifPrefs((prev) => ({
                ...prev,
                email: !prev.email,
              }))
            }
          />
        </label>

        <label className="notification-option">
          <span>
            <strong>In-App</strong>
            <small>Show updates inside your account.</small>
          </span>

          <input
            type="checkbox"
            checked={notifPrefs.inApp}
            onChange={() =>
              setNotifPrefs((prev) => ({
                ...prev,
                inApp: !prev.inApp,
              }))
            }
          />
        </label>

        <label className="notification-option">
          <span>
            <strong>Push</strong>
            <small>Allow browser push notifications.</small>
          </span>

          <input
            type="checkbox"
            checked={notifPrefs.push}
            onChange={() =>
              setNotifPrefs((prev) => ({
                ...prev,
                push: !prev.push,
              }))
            }
          />
        </label>
      </div>

      <div className="notification-history">
        <div className="notification-history-head">
          <h3>Recent Activity</h3>

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount} unread
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={28} />
            <strong>No notifications yet</strong>
            <span>
              Important account updates will appear here.
            </span>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() =>
                  markNotificationRead(notification.id)
                }
              >
                <span className="notification-dot" />

                <span className="notification-content">
                  <strong>{notification.message}</strong>
                  <small>
                    {new Date(
                      notification.date
                    ).toLocaleString()}
                  </small>
                </span>

                {!notification.read && (
                  <span className="new-label">NEW</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderThemeTab = () => {
    const colors = [
      "#0d6efd",
      "#198754",
      "#dc3545",
      "#f7931e",
      "#6f42c1",
    ];

    return (
      <section className="account-card">
        <div className="account-card-head">
          <div>
            <span className="account-kicker">APPEARANCE</span>
            <h1>Theme Settings</h1>
            <p>Customize the appearance of your AirStride account.</p>
          </div>
        </div>

        <div className="theme-section">
          <div className="theme-option-card">
            <div className="theme-option-icon">
              {theme === "dark" ? (
                <Moon size={21} />
              ) : (
                <Sun size={21} />
              )}
            </div>

            <div>
              <strong>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </strong>

              <span>
                {theme === "dark"
                  ? "A darker interface for low-light environments."
                  : "A bright interface for everyday use."}
              </span>
            </div>

            <button
              className="theme-switch"
              type="button"
              onClick={toggleTheme}
            >
              {theme === "dark"
                ? "Use Light"
                : "Use Dark"}
            </button>
          </div>
        </div>

        <div className="accent-section">
          <div className="accent-head">
            <div>
              <h3>Accent Color</h3>
              <span>
                Choose the highlight color used throughout your account.
              </span>
            </div>

            <span
              className="accent-value"
              style={{ borderColor: accentColor }}
            >
              {accentColor}
            </span>
          </div>

          <div className="colors-list">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${
                  accentColor === color ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setAccentColor(color)}
                aria-label={`Use ${color} accent`}
              >
                {accentColor === color && (
                  <Check size={18} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className="theme-preview"
          style={{
            borderColor: accentColor,
          }}
        >
          <span className="preview-label">PREVIEW</span>

          <h3>Your AirStride workspace</h3>

          <p>
            This is how your selected accent color will appear
            across interactive elements.
          </p>

          <button
            type="button"
            style={{
              backgroundColor: accentColor,
            }}
          >
            Example Button
          </button>
        </div>
      </section>
    );
  };

  const renderTab = () => {
    switch (tab) {
      case "password":
        return renderPasswordTab();

      case "alerts":
        return renderAlertsTab();

      case "theme":
        return renderThemeTab();

      default:
        return renderProfileTab();
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme={theme === "dark" ? "dark" : "light"}
      />

      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={250}
        />
      )}

      <div className="settings-page">
        <aside className="account-sidebar">
          <div className="account-sidebar-top">
            <div className="account-mini-avatar">
              {user.profileImg ? (
                <img
                  src={user.profileImg}
                  alt="Profile"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="account-mini-info">
              <strong>
                {user.firstName || "AirStride User"}
              </strong>
              <span>{user.email}</span>
            </div>
          </div>

          <nav className="account-nav">
            {tabs.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`side-btn ${
                    tab === item.id ? "active" : ""
                  }`}
                  onClick={() => setTab(item.id)}
                >
                  <Icon size={18} />

                  <span className="side-label">
                    {item.label}
                  </span>

                  {item.badge > 0 && (
                    <span className="side-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <ShieldCheck size={17} />
            <span>Account protected</span>
          </div>
        </aside>

        <main className="account-content">
          {loading && tab === "profile" ? (
            <section className="account-card account-loading">
              <div className="loading-spinner" />
              <strong>Loading your profile...</strong>
              <span>Please wait a moment.</span>
            </section>
          ) : (
            renderTab()
          )}
        </main>
      </div>
    </>
  );
};

export default AccountSettings;