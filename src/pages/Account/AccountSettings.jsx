// src/pages/Account/AccountSettings.jsx

import React, { useEffect, useState } from "react";
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
  Save,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../contexts/ThemeContext";
import "react-toastify/dist/ReactToastify.css";
import "./AccountSettings.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AccountSettings = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();

  const [user, setUser] = useState({
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
    address: localStorage.getItem("address") || "",
    profileImg: localStorage.getItem("profileImg") || "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [tab, setTab] = useState("profile");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    inApp: true,
    push: false,
  });

  /* ================================
     FETCH PROFILE
  ================================= */

  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem("email");

      if (!email) {
        toast.error("No logged-in user found.");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/users/email/${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        const profile = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || email,
          phone: data.phone || "",
          address: data.address || "",
          profileImg: data.profileImg || "",
        };

        setUser(profile);

        localStorage.setItem("firstName", profile.firstName);
        localStorage.setItem("lastName", profile.lastName);
        localStorage.setItem("email", profile.email);
        localStorage.setItem("phone", profile.phone);
        localStorage.setItem("address", profile.address);
        localStorage.setItem("profileImg", profile.profileImg);
      } catch (error) {
        console.error("Profile error:", error);
        toast.error("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================================
     INPUT HANDLER
  ================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================================
     PROFILE IMAGE
  ================================= */

  const uploadImg = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const image = event.target.result;

      setUser((prev) => ({
        ...prev,
        profileImg: image,
      }));

      localStorage.setItem("profileImg", image);
    };

    reader.readAsDataURL(file);
  };

  const removeImg = () => {
    setUser((prev) => ({
      ...prev,
      profileImg: "",
    }));

    localStorage.removeItem("profileImg");
  };

  const getInitials = () => {
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  /* ================================
     SAVE PROFILE
  ================================= */

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!user.email) {
      toast.error("Email address is missing.");
      return;
    }

    if (!user.firstName.trim() || !user.lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/email/${encodeURIComponent(user.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: user.firstName.trim(),
            lastName: user.lastName.trim(),
            phone: user.phone.trim(),
            address: user.address.trim(),
            profileImg: user.profileImg,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      localStorage.setItem("firstName", user.firstName);
      localStorage.setItem("lastName", user.lastName);
      localStorage.setItem("phone", user.phone);
      localStorage.setItem("address", user.address);
      localStorage.setItem("profileImg", user.profileImg || "");

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error(error.message || "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     PASSWORD STRENGTH
  ================================= */

  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        label: "",
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        level: 1,
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        level: 2,
      };
    }

    return {
      label: "Strong",
      level: 3,
    };
  };

  /* ================================
     CHANGE PASSWORD
  ================================= */

  const changePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    const strength = getPasswordStrength(newPassword);

    if (strength.level < 2) {
      toast.error("Please choose a stronger password.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Password error:", error);
      toast.error(error.message || "Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ================================
     NOTIFICATIONS
  ================================= */

  const addNotification = (message) => {
    if (!notifPrefs.inApp) return;

    setNotifications((prev) => [
      {
        id: Date.now(),
        message,
        read: false,
      },
      ...prev,
    ]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  /* ================================
     TABS
  ================================= */

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
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "theme",
      label: "Appearance",
      icon: theme === "dark" ? Sun : Moon,
    },
  ];

  /* ================================
     PROFILE TAB
  ================================= */

  const renderProfile = () => (
    <section className="account-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h2>Profile Information</h2>
          <p>Manage your personal information and profile.</p>
        </div>
        <User size={24} />
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {user.profileImg ? (
            <img src={user.profileImg} alt="Profile" />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>

        <div className="profile-actions">
          <label className="upload-btn">
            <Upload size={16} />
            Upload Photo

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={uploadImg}
            />
          </label>

          {user.profileImg && (
            <button
              type="button"
              className="remove-btn"
              onClick={removeImg}
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}

          <small>JPG, PNG or WEBP • Max 2MB</small>
        </div>
      </div>

      <form onSubmit={saveProfile} className="account-form">
        <div className="form-row">
          <div className="form-field">
            <label>First Name</label>
            <input
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
            />
          </div>

          <div className="form-field">
            <label>Last Name</label>
            <input
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Email Address</label>
            <input
              value={user.email}
              readOnly
              className="readonly-input"
            />
            <small>Email cannot be changed here.</small>
          </div>

          <div className="form-field">
            <label>Phone Number</label>
            <input
              name="phone"
              value={user.phone}
              onChange={handleChange}
              placeholder="+27..."
            />
          </div>
        </div>

        <div className="form-field">
          <label>Address</label>
          <textarea
            name="address"
            value={user.address}
            onChange={handleChange}
            placeholder="Enter your address"
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          <Save size={17} />

          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );

  /* ================================
     PASSWORD TAB
  ================================= */

  const renderPassword = () => {
    const strength = getPasswordStrength(newPassword);

    return (
      <section className="account-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">SECURITY</span>
            <h2>Password Settings</h2>
            <p>Change your account password securely.</p>
          </div>
          <Lock size={24} />
        </div>

        <form
          onSubmit={changePassword}
          className="account-form"
        >
          <div className="form-field">
            <label>Current Password</label>

            <div className="password-wrapper">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
                required
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>New Password</label>

            <div className="password-wrapper">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Create a new password"
                required
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {newPassword && (
              <div className="strength-container">
                <div className="strength-bars">
                  <span className={strength.level >= 1 ? "active" : ""} />
                  <span className={strength.level >= 2 ? "active" : ""} />
                  <span className={strength.level >= 3 ? "active" : ""} />
                </div>

                <span className={`strength-text strength-${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}

            <small>
              Use at least 8 characters with uppercase letters,
              numbers and symbols.
            </small>
          </div>

          <div className="form-field">
            <label>Confirm New Password</label>

            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Repeat your new password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
              >
                {showConfirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {confirmPassword && (
              <div
                className={
                  newPassword === confirmPassword
                    ? "password-match"
                    : "password-no-match"
                }
              >
                {newPassword === confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={passwordLoading}
          >
            <Lock size={17} />

            {passwordLoading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </section>
    );
  };

  /* ================================
     ALERTS TAB
  ================================= */

  const renderAlerts = () => (
    <section className="account-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">ALERTS</span>
          <h2>Notifications</h2>
          <p>Choose how you want to receive notifications.</p>
        </div>

        <Bell size={24} />
      </div>

      <div className="notification-settings">
        <div className="notification-option">
          <div>
            <strong>Email Notifications</strong>
            <span>Receive important updates by email.</span>
          </div>

          <label className="switch">
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
            <span />
          </label>
        </div>

        <div className="notification-option">
          <div>
            <strong>In-App Notifications</strong>
            <span>Show alerts inside your account.</span>
          </div>

          <label className="switch">
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
            <span />
          </label>
        </div>

        <div className="notification-option">
          <div>
            <strong>Push Notifications</strong>
            <span>Receive browser push notifications.</span>
          </div>

          <label className="switch">
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
            <span />
          </label>
        </div>
      </div>

      <div className="notification-list">
        <h3>Recent Notifications</h3>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={28} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={`notification ${
                notification.read ? "read" : "unread"
              }`}
              onClick={() =>
                markAsRead(notification.id)
              }
            >
              <span>{notification.message}</span>
              {!notification.read && <b>NEW</b>}
            </button>
          ))
        )}
      </div>
    </section>
  );

  /* ================================
     THEME TAB
  ================================= */

  const renderTheme = () => {
    const colors = [
      "#ff8a34",
      "#0d6efd",
      "#198754",
      "#dc3545",
      "#6f42c1",
    ];

    return (
      <section className="account-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">APPEARANCE</span>
            <h2>Theme Settings</h2>
            <p>Customize how your account looks.</p>
          </div>

          {theme === "dark" ? (
            <Sun size={24} />
          ) : (
            <Moon size={24} />
          )}
        </div>

        <div className="theme-section">
          <h3>Interface Theme</h3>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <>
                <Sun size={18} />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon size={18} />
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>

        <div className="theme-section">
          <h3>Accent Color</h3>
          <p>Choose your preferred interface accent.</p>

          <div className="color-list">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${
                  accentColor === color ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setAccentColor(color)}
                aria-label={`Choose ${color}`}
              />
            ))}
          </div>
        </div>

        <div
          className="theme-preview"
          style={{ borderColor: accentColor }}
        >
          <div
            className="preview-dot"
            style={{ backgroundColor: accentColor }}
          />

          <div>
            <strong>Theme Preview</strong>
            <p>Your selected accent will be used throughout the interface.</p>
          </div>
        </div>
      </section>
    );
  };

  /* ================================
     RENDER
  ================================= */

  const renderTab = () => {
    switch (tab) {
      case "profile":
        return renderProfile();

      case "password":
        return renderPassword();

      case "alerts":
        return renderAlerts();

      case "theme":
        return renderTheme();

      default:
        return renderProfile();
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === "dark" ? "dark" : "light"}
      />

      <div className={`account-page ${theme}`}>
        <div className="account-container">

          <div className="account-title">
            <div>
              <span>ACCOUNT</span>
              <h1>Account Settings</h1>
              <p>
                Manage your profile, security and preferences.
              </p>
            </div>
          </div>

          <div className="account-layout">

            <aside className="account-sidebar">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt="Profile"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>

                <div>
                  <strong>
                    {user.firstName || "User"}{" "}
                    {user.lastName}
                  </strong>

                  <span>{user.email}</span>
                </div>
              </div>

              <div className="sidebar-divider" />

              <nav>
                {tabs.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`account-tab ${
                        tab === item.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setTab(item.id);

                        if (item.id === "alerts") {
                          addNotification(
                            "You opened your notification settings."
                          );
                        }
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <main className="account-content">
              {loading && tab === "profile" ? (
                <div className="account-loading">
                  <div className="loading-spinner" />
                  <p>Loading your account...</p>
                </div>
              ) : (
                renderTab()
              )}
            </main>

          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
