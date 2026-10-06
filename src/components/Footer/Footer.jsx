// src/components/Footer.jsx
import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from "react-icons/fa";
import "./Footer.css";
import 'iconify-icon';

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribedEmails, setSubscribedEmails] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [modal, setModal] = useState({ show: false, title: "", content: null });

  const handleSubscribe = (e) => {
    e.preventDefault(); 
    console.log("Subscribe button clicked!");
    console.log("Current email:", email);
    console.log("Subscribed emails before:", subscribedEmails);

    if (!email) {
      console.log("No email entered, showing popup");
      setPopup({ show: true, message: "Please enter a valid email." });
      return;
    }

    if (subscribedEmails.includes(email)) {
      console.log("Email already subscribed:", email);
      setPopup({ show: true, message: `${email} is already part of our team!` });
      return;
    }

    const newSubscribed = [...subscribedEmails, email];
    console.log("Adding email to subscribed list:", email);
    setSubscribedEmails(newSubscribed);
    setPopup({ show: true, message: `You have successfully registered ${email} to the AirStride newsletter!` });
    setEmail("");
    console.log("Email input cleared, subscribedEmails now:", newSubscribed);

    setTimeout(() => {
      console.log("Hiding popup after 3s");
      setPopup({ show: false, message: "" });
    }, 3000);
  };

  const openModal = (type) => {
    if (type === "terms") {
      setModal({
        show: true,
        title: "Terms of Service",
        content: (
          <div>
            <p><strong>Last Updated:</strong> November 25, 2025</p>
            <p>Welcome to AirStride. By accessing or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
            <ol>
              <li><strong>Acceptance of Terms:</strong> By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</li>
              <li><strong>Use of Service:</strong> You agree to use our website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our website.</li>
              <li><strong>User Accounts:</strong> When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account. Notify us immediately upon becoming aware of any breach.</li>
              <li><strong>Intellectual Property Rights:</strong> Content on this website is the property of AirStride or its suppliers. You may not reproduce, distribute, modify, or create derivative works without permission.</li>
              <li><strong>User-Generated Content:</strong> By posting content, you grant us a license to use it and confirm you have rights to it.</li>
              <li><strong>Sports Betting Disclaimer:</strong> Gambling involves risk. You must be of legal age. We are not responsible for losses and do not endorse gambling.</li>
              <li><strong>Accuracy of Information:</strong> We strive to provide accurate information, but cannot guarantee completeness or correctness.</li>
              <li><strong>Third-Party Links:</strong> We are not responsible for content on external websites.</li>
              <li><strong>Limitation of Liability:</strong> We are not liable for indirect or consequential damages.</li>
              <li><strong>Disclaimer of Warranties:</strong> Our service is provided "AS IS" and "AS AVAILABLE".</li>
              <li><strong>Modifications:</strong> Terms may be updated at our discretion.</li>
              <li><strong>Termination:</strong> Accounts may be terminated for breach of Terms.</li>
              <li><strong>Governing Law:</strong> South Africa. Disputes resolved by local courts.</li>
              <li><strong>Contact Information:</strong> Email: support@airstride.com, Johannesburg, South Africa, Phone: +27 11 123 4567</li>
            </ol>
          </div>
        )
      });
    } else if (type === "privacy") {
      setModal({
        show: true,
        title: "Privacy Policy",
        content: (
          <div>
            <p><strong>Last Updated:</strong> November 25, 2025</p>
            <p>At AirStride, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
            <ol>
              <li><strong>Information We Collect:</strong> Personal information you provide, and data collected automatically such as IP, device, cookies.</li>
              <li><strong>How We Use Your Information:</strong> For account management, sending updates, improving our services, and marketing communications with consent.</li>
              <li><strong>How We Share Your Information:</strong> With service providers, during business transfers, with consent, or legally required.</li>
              <li><strong>Third-Party Authentication:</strong> Using Google, Facebook, etc., may share info according to their policies.</li>
              <li><strong>Data Security:</strong> Reasonable measures are taken to protect personal info, but no method is 100% secure.</li>
              <li><strong>Data Retention:</strong> We retain personal info only as long as necessary.</li>
              <li><strong>Your Privacy Rights:</strong> Access, correction, deletion, restriction, portability, withdraw consent.</li>
              <li><strong>Children's Privacy:</strong> Not intended for children under 13 or 16.</li>
              <li><strong>International Transfers:</strong> Your info may be processed in other countries with adequate protection.</li>
              <li><strong>Cookies Policy:</strong> Essential, Analytics, Functional, Advertising. You can manage cookies in browser settings.</li>
              <li><strong>Contact:</strong> Email: privacy@airstride.com, Johannesburg, South Africa, Phone: +27 11 123 4567</li>
            </ol>
          </div>
        )
      });
    }
  };

  return (
    <footer className="footer">
      {/* Newsletter popup */}
      {popup.show && (
        <div className="newsletter-popup">
          {console.log("Popup rendered with message:", popup.message)}
          <span className="popup-close" onClick={() => {
            console.log("Popup manually closed");
            setPopup({ show: false, message: "" });
          }}>
            &times;
          </span>
          <p>{popup.message}</p>
        </div>
      )}

      {/* Full-screen modal */}
      {modal.show && (
        <div className="full-modal" onClick={() => setModal({ show: false, title: "", content: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setModal({ show: false, title: "", content: null })}>
              &times;
            </span>
            <h2>{modal.title}</h2>
            <div className="modal-text">{modal.content}</div>
          </div>
        </div>
      )}

      {/* Footer Top */}
      <div className="footer-top">
        <div className="footer-brand">
          {/* <iconify-icon icon="carbon:running"></iconify-icon> */}
          <h4>AirStride</h4>
          <p>The ultimate destination for premium sneakers and <br></br>independent maker creations. Engineered for <br></br>comfort, styled for the street</p>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><a href="/products">New Arrivals</a></li>
            <li><a href="/best-sellers">Best Sellers</a></li>
            <li><a href="/dates">Release Dates</a></li>
            {/* <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ</a></li> */}
          </ul>
        </div>

        <div className="footer-social">
          <h4>Support</h4>
          <div className="social-icons">
            <ul>
              <li><a href="https://instagram.com" target="_blank">Order Tracking</a></li>
              <li><a href="https://twitter.com" target="_blank">Returns & Exchanges</a></li>
              <li><a href="https://youtube.com" target="_blank">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* <div className="footer-newsletter">
          <h4>Subscribe</h4>
          <p>Get updates and exclusive offers</p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                console.log("Input changed:", e.target.value);
                setEmail(e.target.value);
              }}
            />
            <button type="button" onClick={handleSubscribe}>Subscribe</button>
          </div>
        </div> */}
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AirStride. All rights reserved.Designed with sharp eith aesthetics.</p>
        <div className="legal-links">
          <span className="legal-link-text" onClick={() => openModal("terms")}>Terms of Service</span>
          <span className="legal-link-text" onClick={() => openModal("privacy")}>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
