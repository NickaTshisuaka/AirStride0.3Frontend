// src/pages/Checkout/Checkout.jsx

import React, { useMemo, useState } from "react";
import Confetti from "react-confetti";
import { toast, ToastContainer } from "react-toastify";
import emailjs from "@emailjs/browser";
import "react-toastify/dist/ReactToastify.css";
import "./Checkout.css";
import { useCartContext } from "../../contexts/CartContext";

// ---------------------------------------------
// SETTINGS
// ---------------------------------------------
const SHIPPING_COST = 85;
const VAT_RATE = 0.15;

// ---------------------------------------------
// HELPERS
// ---------------------------------------------
const formatZAR = (amount = 0) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);

const formatCardNumber = (value) =>
  value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/^([2-9])$/, "0$1")
    .replace(/^([01][0-9]{1})([0-9]{0,2})$/, "$1/$2")
    .slice(0, 5);

const formatPhone = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
    .slice(0, 11);

// ---------------------------------------------
// COMPONENT
// ---------------------------------------------
const Checkout = () => {
  const { cart, clearCart } = useCartContext();

  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [orderId] = useState(
    "AS-" + Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    city: "",
    postalCode: "",
    province: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // ---------------------------------------------
  // TOTALS
  // ---------------------------------------------
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      ),
    [cart]
  );

  const vat = useMemo(() => subtotal * VAT_RATE, [subtotal]);

  const total = useMemo(
    () => subtotal + vat + SHIPPING_COST,
    [subtotal, vat]
  );

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (Number(item.quantity) || 1),
        0
      ),
    [cart]
  );

  // ---------------------------------------------
  // UPDATE FORM + VALIDATION
  // ---------------------------------------------
  const update = (key, value) => {
    if (key === "cardNumber") value = formatCardNumber(value);
    if (key === "expiry") value = formatExpiry(value);
    if (key === "phone") value = formatPhone(value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    const newErrors = {
      ...fieldErrors,
    };

    switch (key) {
      case "name":
        newErrors.name = value.trim()
          ? ""
          : "Full Name is required";
        break;

      case "email":
        newErrors.email = /\S+@\S+\.\S+/.test(value)
          ? ""
          : "Email is invalid";
        break;

      case "phone":
        newErrors.phone =
          value.replace(/\s/g, "").length >= 10
            ? ""
            : "Phone is invalid";
        break;

      case "address":
        newErrors.address = value.trim()
          ? ""
          : "Address is required";
        break;

      case "city":
        newErrors.city = value.trim()
          ? ""
          : "City is required";
        break;

      case "postalCode":
        newErrors.postalCode = value.trim()
          ? ""
          : "Postal Code is required";
        break;

      case "province":
        newErrors.province = value.trim()
          ? ""
          : "Province is required";
        break;

      case "cardNumber":
        newErrors.cardNumber =
          value.replace(/\s/g, "").length === 16
            ? ""
            : "Card must be 16 digits";
        break;

      case "expiry":
        newErrors.expiry =
          /^((0[1-9])|(1[0-2]))\/\d{2}$/.test(value)
            ? ""
            : "Expiry MM/YY";
        break;

      case "cvv":
        newErrors.cvv =
          value.replace(/\D/g, "").length === 3
            ? ""
            : "CVV must be 3 digits";
        break;

      default:
        break;
    }

    setFieldErrors(newErrors);
  };

  // ---------------------------------------------
  // VALIDATION
  // ---------------------------------------------
  const validateShipping = () => {
    const errors = [];

    if (!form.name.trim()) errors.push("Full Name is required");
    if (!form.email.trim()) errors.push("Email is required");
    if (!form.phone.trim()) errors.push("Phone Number is required");
    if (!form.address.trim()) errors.push("Address is required");
    if (!form.city.trim()) errors.push("City is required");
    if (!form.postalCode.trim())
      errors.push("Postal Code is required");
    if (!form.province.trim())
      errors.push("Province is required");

    return errors;
  };

  const validatePayment = () => {
    const errors = [];

    const card = form.cardNumber.replace(/\s/g, "");
    const cvv = form.cvv.replace(/\D/g, "");
    const expiry = form.expiry.trim();

    if (card.length !== 16) {
      errors.push("Card Number must be 16 digits");
    }

    if (!/^((0[1-9])|(1[0-2]))\/\d{2}$/.test(expiry)) {
      errors.push("Expiry must be in MM/YY format");
    }

    if (cvv.length !== 3) {
      errors.push("CVV must be 3 digits");
    }

    return errors;
  };

  // ---------------------------------------------
  // SAVE ORDER
  // ---------------------------------------------
  const saveOrderToLocalStorage = (order) => {
    let existingOrders = [];

    try {
      const data = localStorage.getItem("orders");

      if (data) {
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          existingOrders = parsed;
        }
      }
    } catch (error) {
      console.warn(
        "Failed to parse localStorage orders:",
        error
      );
    }

    localStorage.setItem(
      "orders",
      JSON.stringify([...existingOrders, order])
    );
  };

  // ---------------------------------------------
  // PAYMENT
  // ---------------------------------------------
  const handlePay = async () => {
    if (isPaymentProcessing) return;

    if (!cart.length) {
      toast.error("Cart is empty.");
      return;
    }

    const shippingErrors = validateShipping();

    if (shippingErrors.length) {
      shippingErrors.forEach((error) =>
        toast.error(error)
      );

      setStep(0);
      return;
    }

    const paymentErrors = validatePayment();

    if (paymentErrors.length) {
      paymentErrors.forEach((error) =>
        toast.error(error)
      );

      setStep(1);
      return;
    }

    try {
      setIsPaymentProcessing(true);
      setStep(3);

      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      const orderData = {
        orderId,
        date: new Date().toLocaleString(),
        total,
        items: cart,
        shipping: {
          ...form,
        },
      };

      saveOrderToLocalStorage(orderData);

      setCompletedOrder(orderData);

      clearCart();

      setShowConfetti(true);
      setShowSuccessModal(true);

      toast.success("Payment successful! 🎉");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // ---------------------------------------------
  // EMAIL RECEIPT
  // ---------------------------------------------
  const sendEmailReceipt = () => {
    if (!completedOrder) return;

    if (
      !form.email ||
      !/\S+@\S+\.\S+/.test(form.email)
    ) {
      toast.error(
        "Please enter a valid email before emailing receipt."
      );
      return;
    }

    const orderItems = completedOrder.items.map((item) => ({
      name: item.name,
      units: item.quantity,
      price: (
        Number(item.price) * Number(item.quantity)
      ).toFixed(2),
      image_url: item.image,
    }));

    const cost = {
      shipping: SHIPPING_COST.toFixed(2),
      tax: vat.toFixed(2),
      total: total.toFixed(2),
    };

    const templateParams = {
      email: form.email,
      customer_name: form.name,
      order_id: completedOrder.orderId,
      orders: orderItems,
      cost,
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success(
          `Receipt sent to ${form.email} 🎉`
        );

        setShowConfetti(false);
        setShowEmailPopup(false);
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        toast.error(
          "Email failed. Check your EmailJS configuration."
        );
      });
  };

  // ---------------------------------------------
  // DOWNLOAD RECEIPT
  // ---------------------------------------------
  const downloadReceipt = () => {
    if (!completedOrder) return;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt ${completedOrder.orderId}</title>
        </head>

        <body style="font-family: Arial; padding: 20px;">
          <h2>Order Receipt</h2>

          <p>
            <strong>Order ID:</strong>
            ${completedOrder.orderId}
          </p>

          <p>
            <strong>Customer:</strong>
            ${form.name} (${form.email})
          </p>

          <table
            border="1"
            cellpadding="8"
            cellspacing="0"
            width="100%"
          >
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${completedOrder.items
                .map(
                  (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${formatZAR(item.price)}</td>
                      <td>
                        ${formatZAR(
                          item.price * item.quantity
                        )}
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <h3>
            Grand Total:
            ${formatZAR(completedOrder.total)}
          </h3>
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `Receipt-${completedOrder.orderId}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowConfetti(false);
  };

  // ---------------------------------------------
  // INPUT CLASS
  // ---------------------------------------------
  const inputClass = (field) =>
    fieldErrors[field] ? "input-error" : "";

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  return (
    <div className="checkout-container">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      <ToastContainer />

      <h1>Checkout</h1>

      {/* STEPS */}
      <div className="steps">
        <button
          className={step === 0 ? "active" : ""}
          onClick={() => setStep(0)}
        >
          Shipping
        </button>

        <button
          className={step === 1 ? "active" : ""}
          onClick={() => setStep(1)}
        >
          Payment
        </button>

        <button
          className={step === 2 ? "active" : ""}
          onClick={() => setStep(2)}
        >
          Review
        </button>
      </div>

      {/* CONTENT */}
      <div className="step-content">

        {/* SHIPPING */}
        {step === 0 && (
          <div className="form-section">
            <input
              className={inputClass("name")}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
            />

            <input
              className={inputClass("email")}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
            />

            <input
              className={inputClass("phone")}
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value)
              }
            />

            <input
              className={inputClass("address")}
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                update("address", e.target.value)
              }
            />

            <input
              placeholder="Suburb"
              value={form.suburb}
              onChange={(e) =>
                update("suburb", e.target.value)
              }
            />

            <input
              className={inputClass("city")}
              placeholder="City"
              value={form.city}
              onChange={(e) =>
                update("city", e.target.value)
              }
            />

            <input
              className={inputClass("postalCode")}
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(e) =>
                update("postalCode", e.target.value)
              }
            />

            <input
              className={inputClass("province")}
              placeholder="Province"
              value={form.province}
              onChange={(e) =>
                update("province", e.target.value)
              }
            />

            <button onClick={() => setStep(1)}>
              Next →
            </button>
          </div>
        )}

        {/* PAYMENT */}
        {step === 1 && (
          <div className="form-section">
            <input
              className={inputClass("cardNumber")}
              placeholder="Card Number (16 digits)"
              value={form.cardNumber}
              maxLength={19}
              inputMode="numeric"
              onChange={(e) =>
                update("cardNumber", e.target.value)
              }
            />

            <input
              className={inputClass("expiry")}
              placeholder="Expiry (MM/YY)"
              value={form.expiry}
              maxLength={5}
              inputMode="numeric"
              onChange={(e) =>
                update("expiry", e.target.value)
              }
            />

            <input
              className={inputClass("cvv")}
              placeholder="CVV"
              maxLength={3}
              type="password"
              inputMode="numeric"
              value={form.cvv}
              onChange={(e) =>
                update("cvv", e.target.value)
              }
            />

            <button onClick={() => setStep(2)}>
              Next →
            </button>
          </div>
        )}

        {/* REVIEW */}
        {step === 2 && (
          <div className="review-section">
            <h2>Order Summary</h2>

            <p>
              Items: <strong>{totalItems}</strong>
            </p>

            <p>
              Subtotal: <strong>{formatZAR(subtotal)}</strong>
            </p>

            <p>
              VAT: <strong>{formatZAR(vat)}</strong>
            </p>

            <p>
              Shipping:{" "}
              <strong>{formatZAR(SHIPPING_COST)}</strong>
            </p>

            <h3>
              Total: <strong>{formatZAR(total)}</strong>
            </h3>

            <button
              className="pay-btn"
              onClick={handlePay}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing
                ? "Processing…"
                : "PAY NOW"}
            </button>
          </div>
        )}
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && completedOrder && (
        <div className="success-modal">
          <h2>🎉 Payment Successful!</h2>

          <p>
            Your order ID is{" "}
            <strong>{completedOrder.orderId}</strong>
          </p>

          <button
            onClick={() => {
              downloadReceipt();
            }}
          >
            Download Receipt
          </button>

          <button
            onClick={() => {
              setShowEmailPopup(true);
            }}
          >
            Email Receipt
          </button>

          <button
            onClick={() => {
              setShowConfetti(false);
              setShowSuccessModal(false);
              window.location.href =
                "/past-purchases";
            }}
          >
            View Past Purchases
          </button>
        </div>
      )}

      {/* EMAIL POPUP */}
      {showEmailPopup && (
        <div className="email-popup">
          <h3>Email Receipt</h3>

          <p>
            Sending to:{" "}
            <strong>{form.email}</strong>
          </p>

          <button onClick={sendEmailReceipt}>
            Send Now
          </button>

          <button
            onClick={() => setShowEmailPopup(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
