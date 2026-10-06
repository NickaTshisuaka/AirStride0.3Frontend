import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../AuthContext";
import "./Logout.css";

const LOGOUT_GRACE_PERIOD_MS = 3000;

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const logoutTimerRef = useRef(null);
  const cancelTimerRef = useRef(null);

  const handleOpen = () => {
    setIsOpen(true);
    setIsLoggingOut(false);
    setIsCancelling(false);
  };

  const handleClose = () => {
    if (!isLoggingOut) {
      setIsOpen(false);
    }
  };

  const performLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);

    logoutTimerRef.current = setTimeout(() => {
      performLogout();
    }, LOGOUT_GRACE_PERIOD_MS);
  };

  const handleCancelLogout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    setIsCancelling(true);

    cancelTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsLoggingOut(false);
      setIsCancelling(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen && !isLoggingOut) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isLoggingOut]);

  return (
    <>
      <button
        type="button"
        className="account-logout-button"
        onClick={handleOpen}
      >
        Log Out
      </button>

      {isOpen && (
        <div
          className="account-logout-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isLoggingOut
            ) {
              handleClose();
            }
          }}
        >
          <div
            className="account-logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-logout-title"
          >
            {!isLoggingOut && (
              <button
                type="button"
                className="account-logout-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}

            {!isLoggingOut && (
              <>
                <div className="account-logout-icon">
                  ↪
                </div>

                <h2 id="account-logout-title">
                  Log Out?
                </h2>

                <p>
                  Are you sure you want to log out of your
                  account?
                </p>

                <div className="account-logout-actions">
                  <button
                    type="button"
                    className="account-logout-cancel"
                    onClick={handleClose}
                  >
                    Stay Logged In
                  </button>

                  <button
                    type="button"
                    className="account-logout-confirm"
                    onClick={handleConfirmLogout}
                  >
                    Yes, Log Me Out
                  </button>
                </div>
              </>
            )}

            {isLoggingOut && !isCancelling && (
              <>
                <div className="account-logout-spinner" />

                <h2>
                  Logging You Out...
                </h2>

                <p>
                  This will take just a moment.
                </p>

                <button
                  type="button"
                  className="account-logout-cancel"
                  onClick={handleCancelLogout}
                >
                  Cancel Logout
                </button>
              </>
            )}

            {isLoggingOut && isCancelling && (
              <>
                <div className="account-logout-success">
                  ✓
                </div>

                <h2>
                  Logout Cancelled
                </h2>

                <p>
                  Keeping you logged in.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;
