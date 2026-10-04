// src/pages/Checkout/Checkout.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { toast, ToastContainer } from "react-toastify";
import emailjs from "@emailjs/browser";
import "react-toastify/dist/ReactToastify.css";
import "./Checkout.css";
import { useCartContext } from "../../contexts/CartContext";

const SHIPPING_COST = 85;
const VAT_RATE = 0.15;

const formatZAR = (amount = 0) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value) => {
  const numbers = value.replace(/\D/g, "").slice(0, 4);

  if (numbers.length >= 3) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  return numbers;
};

const formatPhone = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 10)
    .replace(/(\d{3})(\d{3})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a} ${b} ${c}` : `${a} ${b}`
    );

const isValidExpiry = (value) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
    return false;
  }

  const [month, year] = value.split("/").map(Number);

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartContext();

  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [orderId] = useState(
    `AS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
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

  const update = (key, value) => {
    if (key === "cardNumber") {
      value = formatCardNumber(value);
    }

    if (key === "expiry") {
      value = formatExpiry(value);
    }

    if (key === "phone") {
      value = formatPhone(value);
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validateShipping = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Enter a valid email address";
    }

    if (form.phone.replace(/\D/g, "").length !== 10) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!form.address.trim()) {
      errors.address = "Address is required";
    }

    if (!form.city.trim()) {
      errors.city = "City is required";
    }

    if (!form.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    }

    if (!form.province.trim()) {
      errors.province = "Province is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors = {};

    const card = form.cardNumber.replace(/\D/g, "");
    const cvv = form.cvv.replace(/\D/g, "");

    if (card.length !== 16) {
      errors.cardNumber = "Card number must contain 16 digits";
    }

    if (!isValidExpiry(form.expiry)) {
      errors.expiry = "Enter a valid, non-expired MM/YY";
    }

    if (cvv.length !== 3) {
      errors.cvv = "CVV must contain 3 digits";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const saveOrderToLocalStorage = (order) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      const orders = Array.isArray(existing) ? existing : [];

      localStorage.setItem(
        "orders",
        JSON.stringify([...orders, order])
      );
    } catch (error) {
      console.error("Could not save order:", error);
    }
  };

  const goToPayment = () => {
    if (!validateShipping()) {
      toast.error("Please complete your shipping information.");
      return;
    }

    setStep(1);
  };

  const goToReview = () => {
    if (!validatePayment()) {
      toast.error("Please check your payment details.");
      return;
    }

    setStep(2);
  };

  const handlePay = async () => {
    if (isPaymentProcessing) return;

    if (!cart.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!validateShipping()) {
      setStep(0);
      toast.error("Please complete your shipping information.");
      return;
    }

    if (!validatePayment()) {
      setStep(1);
      toast.error("Please check your payment details.");
      return;
    }

    try {
      setIsPaymentProcessing(true);

      /*
        Demo payment delay.

        Replace this section with your real Paystack/payment
        initialization when you connect the live payment system.
      */
      await new Promise((resolve) => setTimeout(resolve, 1500));

      /*
        IMPORTANT:
        Do NOT save cardNumber, expiry, or CVV.
      */
      const orderData = {
        orderId,
        date: new Date().toISOString(),
        status: "Paid",
        total,
        subtotal,
        vat,
        shippingCost: SHIPPING_COST,
        totalItems,
        items: cart.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || item.imageUrl || "",
        })),
        shipping: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          suburb: form.suburb,
          city: form.city,
          postalCode: form.postalCode,
          province: form.province,
        },
      };

      saveOrderToLocalStorage(orderData);

      setCompletedOrder(orderData);
      clearCart();

      setShowConfetti(true);
      setShowSuccessModal(true);

      toast.success("Payment successful!");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const sendEmailReceipt = async () => {
    if (!completedOrder) return;

    try {
      const orderItems = completedOrder.items.map((item) => ({
        name: item.name,
        units: item.quantity,
        price: (item.price * item.quantity).toFixed(2),
        image_url: item.image,
      }));

      const templateParams = {
        email: completedOrder.shipping.email,
        customer_name: completedOrder.shipping.name,
        order_id: completedOrder.orderId,
        orders: orderItems,
        cost: {
          shipping: SHIPPING_COST.toFixed(2),
          tax: vat.toFixed(2),
          total: total.toFixed(2),
        },
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success(
        `Receipt sent to ${completedOrder.shipping.email}`
      );
    } catch (error) {
      console.error("EmailJS error:", error);
      toast.error("Could not send the email receipt.");
    }
  };

  const downloadReceipt = () => {
    if (!completedOrder) return;

    const itemsHtml = completedOrder.items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatZAR(item.price)}</td>
            <td>${formatZAR(item.price * item.quantity)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>AirStride Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #222;
          }

          h1 {
            margin-bottom: 5px;
          }

          .muted {
            color: #777;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }

          th, td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          .total {
            text-align: right;
            margin-top: 25px;
          }
        </style>
      </head>

      <body>
        <h1>AirStride</h1>
        <p class="muted">Order Receipt</p>

        <p>
          <strong>Order ID:</strong>
          ${completedOrder.orderId}
        </p>

        <p>
          <strong>Customer:</strong>
          ${completedOrder.shipping.name}
        </p>

        <p>
          <strong>Email:</strong>
          ${completedOrder.shipping.email}
        </p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          <p>Subtotal: ${formatZAR(completedOrder.subtotal)}</p>
          <p>VAT: ${formatZAR(completedOrder.vat)}</p>
          <p>Shipping: ${formatZAR(completedOrder.shippingCost)}</p>
          <h2>Total: ${formatZAR(completedOrder.total)}</h2>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `AirStride-${completedOrder.orderId}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const finishCheckout = () => {
    setShowConfetti(false);
    setShowSuccessModal(false);
    navigate("/past-purchases");
  };

  if (!cart.length && !completedOrder) {
    return (
      <div className="checkout-page">
        <ToastContainer position="top-right" />

        <div className="empty-checkout">
          <div className="empty-icon">🛒</div>

          <h1>Your cart is empty</h1>

          <p>
            Add some AirStride products before continuing to checkout.
          </p>

          <button
            className="checkout-primary"
            onClick={() => navigate("/shop")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <ToastContainer position="top-right" />

      <div className="checkout-shell">

        <div className="checkout-header">
          <span className="checkout-label">
            AIRSTRIDE // SECURE CHECKOUT
          </span>

          <h1>Complete your order</h1>

          <p>
            Review your details and complete your purchase.
          </p>
        </div>

        <div className="checkout-layout">

          <main className="checkout-main">

            <div className="checkout-steps">

              <button
                className={step === 0 ? "active" : ""}
                onClick={() => setStep(0)}
              >
                <span>01</span>
                Shipping
              </button>

              <div className="step-line" />

              <button
                className={step === 1 ? "active" : ""}
                onClick={() => {
                  if (validateShipping()) {
                    setStep(1);
                  }
                }}
              >
                <span>02</span>
                Payment
              </button>

              <div className="step-line" />

              <button
                className={step === 2 ? "active" : ""}
                onClick={() => {
                  if (
                    validateShipping() &&
                    validatePayment()
                  ) {
                    setStep(2);
                  }
                }}
              >
                <span>03</span>
                Review
              </button>

            </div>

            {step === 0 && (
              <section className="checkout-card">

                <div className="section-heading">
                  <div>
                    <span>01</span>
                    <h2>Shipping information</h2>
                  </div>

                  <p>Where should we deliver your order?</p>
                </div>

                <div className="form-grid">

                  <div className="field full">
                    <label>Full Name</label>
                    <input
                      className={fieldErrors.name ? "error" : ""}
                      value={form.name}
                      onChange={(e) =>
                        update("name", e.target.value)
                      }
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && (
                      <small>{fieldErrors.name}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      className={fieldErrors.email ? "error" : ""}
                      value={form.email}
                      onChange={(e) =>
                        update("email", e.target.value)
                      }
                      placeholder="john@example.com"
                    />
                    {fieldErrors.email && (
                      <small>{fieldErrors.email}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className={fieldErrors.phone ? "error" : ""}
                      value={form.phone}
                      onChange={(e) =>
                        update("phone", e.target.value)
                      }
                      placeholder="082 123 4567"
                    />
                    {fieldErrors.phone && (
                      <small>{fieldErrors.phone}</small>
                    )}
                  </div>

                  <div className="field full">
                    <label>Street Address</label>
                    <input
                      className={fieldErrors.address ? "error" : ""}
                      value={form.address}
                      onChange={(e) =>
                        update("address", e.target.value)
                      }
                      placeholder="123 Example Street"
                    />
                    {fieldErrors.address && (
                      <small>{fieldErrors.address}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Suburb</label>
                    <input
                      value={form.suburb}
                      onChange={(e) =>
                        update("suburb", e.target.value)
                      }
                      placeholder="Sandton"
                    />
                  </div>

                  <div className="field">
                    <label>City</label>
                    <input
                      className={fieldErrors.city ? "error" : ""}
                      value={form.city}
                      onChange={(e) =>
                        update("city", e.target.value)
                      }
                      placeholder="Johannesburg"
                    />
                    {fieldErrors.city && (
                      <small>{fieldErrors.city}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Postal Code</label>
                    <input
                      className={
                        fieldErrors.postalCode ? "error" : ""
                      }
                      value={form.postalCode}
                      onChange={(e) =>
                        update("postalCode", e.target.value)
                      }
                      placeholder="2196"
                    />
                    {fieldErrors.postalCode && (
                      <small>{fieldErrors.postalCode}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Province</label>
                    <select
                      className={
                        fieldErrors.province ? "error" : ""
                      }
                      value={form.province}
                      onChange={(e) =>
                        update("province", e.target.value)
                      }
                    >
                      <option value="">
                        Select province
                      </option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">
                        Western Cape
                      </option>
                      <option value="KwaZulu-Natal">
                        KwaZulu-Natal
                      </option>
                      <option value="Eastern Cape">
                        Eastern Cape
                      </option>
                      <option value="Free State">
                        Free State
                      </option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">
                        Mpumalanga
                      </option>
                      <option value="North West">
                        North West
                      </option>
                      <option value="Northern Cape">
                        Northern Cape
                      </option>
                    </select>

                    {fieldErrors.province && (
                      <small>{fieldErrors.province}</small>
                    )}
                  </div>

                </div>

                <div className="checkout-actions">
                  <button
                    className="checkout-primary"
                    onClick={goToPayment}
                  >
                    Continue to Payment
                    <span>→</span>
                  </button>
                </div>

              </section>
            )}

            {step === 1 && (
              <section className="checkout-card">

                <div className="section-heading">
                  <div>
                    <span>02</span>
                    <h2>Payment details</h2>
                  </div>

                  <p>Your payment information is used only for checkout.</p>
                </div>

                <div className="secure-payment">
                  <div className="secure-icon">✓</div>

                  <div>
                    <strong>Secure payment</strong>
                    <p>
                      Your card details are not saved with your order.
                    </p>
                  </div>
                </div>

                <div className="form-grid payment-grid">

                  <div className="field full">
                    <label>Card Number</label>

                    <input
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className={
                        fieldErrors.cardNumber ? "error" : ""
                      }
                      value={form.cardNumber}
                      onChange={(e) =>
                        update("cardNumber", e.target.value)
                      }
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />

                    {fieldErrors.cardNumber && (
                      <small>{fieldErrors.cardNumber}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>Expiry Date</label>

                    <input
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className={
                        fieldErrors.expiry ? "error" : ""
                      }
                      value={form.expiry}
                      onChange={(e) =>
                        update("expiry", e.target.value)
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                    />

                    {fieldErrors.expiry && (
                      <small>{fieldErrors.expiry}</small>
                    )}
                  </div>

                  <div className="field">
                    <label>CVV</label>

                    <input
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      type="password"
                      className={
                        fieldErrors.cvv ? "error" : ""
                      }
                      value={form.cvv}
                      onChange={(e) =>
                        update(
                          "cvv",
                          e.target.value.replace(/\D/g, "").slice(0, 3)
                        )
                      }
                      placeholder="•••"
                      maxLength={3}
                    />

                    {fieldErrors.cvv && (
                      <small>{fieldErrors.cvv}</small>
                    )}
                  </div>

                </div>

                <div className="checkout-actions split">
                  <button
                    className="checkout-secondary"
                    onClick={() => setStep(0)}
                  >
                    ← Back
                  </button>

                  <button
                    className="checkout-primary"
                    onClick={goToReview}
                  >
                    Review Order
                    <span>→</span>
                  </button>
                </div>

              </section>
            )}

            {step === 2 && (
              <section className="checkout-card">

                <div className="section-heading">
                  <div>
                    <span>03</span>
                    <h2>Review your order</h2>
                  </div>

                  <p>Everything look correct?</p>
                </div>

                <div className="review-box">

                  <div className="review-header">
                    <div>
                      <span>ORDER</span>
                      <strong>{orderId}</strong>
                    </div>

                    <span className="review-status">
                      READY
                    </span>
                  </div>

                  <div className="review-items">
                    {cart.map((item) => (
                      <div
                        className="review-item"
                        key={item.product_id || item.id || item._id}
                      >
                        <div className="review-product">

                          <div className="review-image">
                            <img
                              src={
                                item.image ||
                                item.imageUrl ||
                                "https://placehold.co/100x100"
                              }
                              alt={item.name}
                            />
                          </div>

                          <div>
                            <strong>{item.name}</strong>
                            <span>
                              Qty: {item.quantity || 1}
                            </span>
                          </div>

                        </div>

                        <strong>
                          {formatZAR(
                            Number(item.price) *
                              (Number(item.quantity) || 1)
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="review-divider" />

                  <div className="review-details">

                    <div>
                      <span>Deliver to</span>
                      <strong>{form.name}</strong>
                      <p>
                        {form.address}
                        {form.suburb
                          ? `, ${form.suburb}`
                          : ""}
                        <br />
                        {form.city}, {form.province}
                        <br />
                        {form.postalCode}
                      </p>
                    </div>

                    <div>
                      <span>Contact</span>
                      <strong>{form.email}</strong>
                      <p>{form.phone}</p>
                    </div>

                  </div>

                </div>

                <div className="checkout-actions split">

                  <button
                    className="checkout-secondary"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>

                  <button
                    className="pay-button"
                    onClick={handlePay}
                    disabled={isPaymentProcessing}
                  >
                    {isPaymentProcessing
                      ? "Processing..."
                      : `Pay ${formatZAR(total)}`}
                  </button>

                </div>

              </section>
            )}

          </main>

          <aside className="order-sidebar">

            <div className="summary-card">

              <div className="summary-title">
                <span>YOUR ORDER</span>
                <strong>{totalItems} items</strong>
              </div>

              <div className="summary-items">
                {cart.map((item) => (
                  <div
                    className="summary-item"
                    key={
                      item.product_id ||
                      item.id ||
                      item._id
                    }
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity || 1} ×{" "}
                        {formatZAR(item.price)}
                      </span>
                    </div>

                    <strong>
                      {formatZAR(
                        Number(item.price) *
                          (Number(item.quantity) || 1)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-line">
                <span>Subtotal</span>
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

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatZAR(total)}</strong>
              </div>

            </div>

            <div className="checkout-security">
              <span>✓</span>
              <div>
                <strong>Secure checkout</strong>
                <p>
                  Your card information is never stored in your order history.
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

      {showSuccessModal && completedOrder && (
        <div className="modal-overlay">

          <div className="success-modal">

            <div className="success-icon">
              ✓
            </div>

            <span className="success-label">
              PAYMENT COMPLETE
            </span>

            <h2>Order confirmed!</h2>

            <p>
              Thanks, {completedOrder.shipping.name.split(" ")[0]}.
              Your AirStride order has been successfully placed.
            </p>

            <div className="success-order">
              <span>ORDER ID</span>
              <strong>{completedOrder.orderId}</strong>
            </div>

            <div className="success-total">
              <span>Total paid</span>
              <strong>{formatZAR(completedOrder.total)}</strong>
            </div>

            <div className="success-actions">

              <button
                className="checkout-primary"
                onClick={() => {
                  downloadReceipt();
                  setShowSuccessModal(false);
                  setShowConfetti(false);
                }}
              >
                Download Receipt
              </button>

              <button
                className="checkout-secondary"
                onClick={sendEmailReceipt}
              >
                Email Receipt
              </button>

              <button
                className="text-button"
                onClick={finishCheckout}
              >
                View Past Purchases →
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Checkout;