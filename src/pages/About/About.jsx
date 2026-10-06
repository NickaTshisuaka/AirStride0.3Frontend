// src/pages/About/About.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaRecycle,
  FaBoxOpen,
  FaArrowLeft,
  FaArrowRight,
  FaInstagram,
  FaTwitter,
  FaLinkedin
} from "react-icons/fa";
import "./About.css";

const fadeUp = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
  viewport: { once: true, amount: 0.2 }
};

export default function AboutPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [ceoModal, setCeoModal] = useState(false);
  const [testimonial, setTestimonial] = useState(0);

  const testimonials = [
    {
      quote:
        "More than expected — crazy soft, flexible and perfectly fitted sportswear.",
      name: "CASUAL WAY"
    },
    {
      quote:
        "AirStride has completely changed the way I approach my runs. Everything feels lighter.",
      name: "RUNNER REVIEW"
    },
    {
      quote:
        "The breathing experience is incredible. Comfortable, simple and made for movement.",
      name: "ATHLETE REVIEW"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !videoRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const offset = -rect.top * 0.22;

      videoRef.current.style.transform = `translateY(${offset}px) scale(1.05)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextTestimonial = () => {
    setTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero" ref={heroRef}>
        <video
          ref={videoRef}
          className="about-hero-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/bokke.mp4" type="video/mp4" />
        </video>

        <div className="about-hero-overlay" />

        <motion.div
          className="about-hero-content"
          {...fadeUp}
        >
          <h1>ABOUT US</h1>
        </motion.div>
      </section>


      {/* WE ARE CARE */}
      <section className="care-section">
        <motion.h2 {...fadeUp}>WE ARE CARE</motion.h2>

        <div className="care-line" />

        <div className="care-grid">

          <div className="care-item">
            <FaLeaf />
            <span>ENVIRONMENTALLY FRIENDLY</span>
          </div>

          <div className="care-item">
            <FaRecycle />
            <span>NON-TOXIC MATERIALS</span>
          </div>

          <div className="care-item">
            <FaBoxOpen />
            <span>15 DAYS RETURNS</span>
          </div>

        </div>

        <div className="care-line bottom-line" />
      </section>


      {/* WHO WE ARE */}
      <section className="about-story">

        <motion.div
          className="story-image"
          {...fadeUp}
        >
          <img
            src="/selfieGirls.jpeg"
            alt="AirStride runners"
          />
        </motion.div>

        <motion.div
          className="story-copy"
          {...fadeUp}
        >
          <h2>WHO WE ARE</h2>

          <p>
            AirStride began with a simple truth: running is freedom,
            but only if your body moves in harmony with your breath.
            We watched countless joggers struggle with endurance not
            because of strength — but because of breathing.
          </p>

          <p>
            That observation became the foundation of AirStride.
            We create products designed around natural movement,
            comfort and the rhythm of the human body.
          </p>
        </motion.div>

      </section>


      {/* WHY WE DO IT */}
      <section className="why-section">

        <motion.div
          className="why-copy"
          {...fadeUp}
          
        >
          <h2>WHY WE DO IT</h2>

          <p>
            AirStride exists because movement should feel natural.
            We believe running should not feel like a battle against
            your clothing, your equipment or your own body.
          </p>

          <p>
            Everything we create is designed to help you breathe
            easier, move freely and enjoy every kilometre.
          </p>
        </motion.div>

      </section>


      {/* LARGE IMAGE */}
      <motion.section
        className="wide-image-section"
        {...fadeUp}
      >
        <img
          src="/Soccer.jpeg"
          alt="AirStride community"
          onError={(e) => {
            e.currentTarget.src = "/Soccer.jpeg";
          }}
        />
      </motion.section>


      {/* QUOTE */}
      <section className="quote-section">

        <button
          className="quote-arrow"
          onClick={previousTestimonial}
          aria-label="Previous"
        >
          <FaArrowLeft />
        </button>

        <motion.blockquote
          key={testimonial}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          “Every product we make exists for one purpose:
          helping you breathe easier, run further, and feel more alive.”
        </motion.blockquote>

        <button
          className="quote-arrow"
          onClick={nextTestimonial}
          aria-label="Next"
        >
          <FaArrowRight />
        </button>

      </section>


      {/* TEAM */}
      <section className="team-section">

        <motion.h2 {...fadeUp}>
          MEET THE TEAM
        </motion.h2>

        <div className="team-strip">

          <div className="team-image">
            <img src="/gloria.jpeg" alt="Gloria Ngonda" />
            <div className="team-overlay">
              <h3>Gloria</h3>
              <p>Breathing Science</p>
            </div>
          </div>

          <div className="team-image">
            <img src="/keren.jpeg" alt="Keren Botombe" />
            <div className="team-overlay">
              <h3>Keren</h3>
              <p>Fitness & Endurance</p>
            </div>
          </div>

          <div className="team-image">
            <img src="/tegra.jpeg" alt="Tegra Mungundi" />
            <div className="team-overlay">
              <h3>Tegra</h3>
              <p>Lead Developer</p>
            </div>
          </div>

          <div className="team-image">
            <img src="/tracy.jpeg" alt="Tracy Bebel" />
            <div className="team-overlay">
              <h3>Tracy</h3>
              <p>Product Designer</p>
            </div>
          </div>

        </div>

      </section>


      {/* TESTIMONIAL */}
      <section className="testimonial-section">

        <p className="testimonial-label">
          WE LOVE GOOD COMPLIMENT
        </p>

        <motion.div
          key={testimonial}
          className="testimonial-content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="testimonial-quote">
            “{testimonials[testimonial].quote}”
          </p>

          <span>{testimonials[testimonial].name}</span>
        </motion.div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={index === testimonial ? "active" : ""}
              onClick={() => setTestimonial(index)}
              aria-label={`Testimonial ${index + 1}`}
            />
          ))}
        </div>

      </section>


      {/* FOUNDER */}
      <section className="founder-section">

        <div className="founder-video">
          <video autoPlay muted loop playsInline>
            <source src="/jonathan.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="founder-copy">
          <p className="small-label">OUR FOUNDER</p>

          <h2>JONATHAN KABANGO</h2>

          <p>
            "AirStride isn’t just a company — it’s a promise.
            A promise that every runner deserves the freedom of
            full, easy breaths."
          </p>

          <button
            className="founder-button"
            onClick={() => setCeoModal(true)}
          >
            CONTACT THE FOUNDER
          </button>
        </div>

      </section>


      {/* MODALs */}
      {ceoModal && (
        <div
          className="ceo-modal"
          onClick={() => setCeoModal(false)}
        >
          <div
            className="ceo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setCeoModal(false)}
            >
              ×
            </button>

            <p className="small-label">CONTACT</p>

            <h2>JONATHAN KABANGO</h2>

            <p>
              <strong>Phone:</strong> +27 71 123 4567
            </p>

            <p>
              <strong>Email:</strong>{" "}
              jonathan.kabango@airstride.com
            </p>

            <div className="ceo-social-icons">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
              >
                <FaTwitter />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}