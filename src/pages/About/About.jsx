// src/pages/About/About.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaLightbulb, FaHeartbeat, FaRunning, FaUsers, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { SlPresent } from "react-icons/sl";
import { TbTruckReturn } from "react-icons/tb";
import { AiOutlineSafety } from "react-icons/ai";
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
      <header className="hero" ref={heroRef}>
        {/* <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline>
          <source src="/bokke.mp4" type="video/mp4" />
        </video> */}
        <img className="hero-image" src="https://img.magnific.com/premium-photo/group-portrait-smile-workout-gym-training-exercise-class-healthcare-bonding-wellness-people-diversity-motivation-sports-teamwork-support-collaboration_590464-457952.jpg?semt=ais_hybrid&w=740&q=80" alt="AirStride hero" />
        <div className="hero-overlay" />
        <motion.div {...fadeUp} className="hero-inner" viewport={{ once: true }}>
          <h1>ABOUT US</h1>
          {/* <p className="subtitle">Helping joggers breathe better, run further, and live healthier.</p> */}
          {/* <button className="hero-cta" onClick={() => navigate("/products")}>Explore Products</button> */}
        </motion.div>
      </header>

      <section  className="intro-section">
        <p className="section-title">WE CARE</p>
        <hr className="section-divider" />
        <ul>
          <li><span><SlPresent size={40} /></span>Environmental friendly</li>
          <li><span><TbTruckReturn size={40} /></span>Free returns</li>
          <li><span><AiOutlineSafety size={40} /></span>Safe and reliable</li>
        </ul>

      </section>

      {/* STORY */}
      <section className="story-section">
        <motion.div className="story-media" {...fadeIn} viewport={{ once: true }}>
          <img src="/selfieGirls.jpeg" alt="AirStride story" />
        </motion.div>
        <motion.article className="story-text" {...fadeUp} viewport={{ once: true }}>
          <h2>WHO WE ARE</h2>
          <p>
            AirStride began with a simple truth: running is freedom, but only if your body moves in harmony with your breath.
            We watched countless joggers struggle with endurance not because of strength — but because of breathing. That inspired
            us to design tools that help people reconnect with their rhythm and unlock the joy of effortless movement.
          </p>
          <p>
            Today, AirStride continues that mission by blending research, innovation, and heart. Every product we make exists
            for one purpose: helping you breathe easier, run further, and feel more alive.
          </p>
          {/* <button className="cta-btn" onClick={() => navigate("/products")}>Explore Products</button> */}
        </motion.article>
      </section>

      {/* VALUES */}
      <section className="values-section">
        <h2 className="section-title">WHY WE DO IT</h2>
       
        {/* <div className="values-grid">
          <motion.div {...fadeUp} className="value-card" viewport={{ once: true }}>
            <FaLightbulb className="value-icon" />
            <h4>Innovation</h4>
            <p>Pushing boundaries with research-driven design.</p>
          </motion.div>
          <motion.div {...fadeUp} className="value-card" transition={{ delay: 0.15 }} viewport={{ once: true }}>
            <FaHeartbeat className="value-icon" />
            <h4>Health</h4>
            <p>Prioritizing long-term breathing efficiency and wellbeing.</p>
          </motion.div>
          <motion.div {...fadeUp} className="value-card" transition={{ delay: 0.3 }} viewport={{ once: true }}>
            <FaRunning className="value-icon" />
            <h4>Performance</h4>
            <p>Empowering runners to go further with confidence.</p>
          </motion.div>
          <motion.div {...fadeUp} className="value-card" transition={{ delay: 0.45 }} viewport={{ once: true }}>
            <FaUsers className="value-icon" />
            <h4>Community</h4>
            <p>Supporting every runner — beginners to pros.</p>
          </motion.div>
        </div> */}
        <img className="team-image" src="https://photos.peopleimages.com/picture/202303/2676591-low-angle-fitness-or-rugby-team-in-huddle-with-support-or-solidarity-for-competition-training-game.-men-group-happy-smile-or-athletes-in-sports-match-or-exercise-together-with-pride-or-mission-fit_400_400.jpg" alt="Our Team" />
         <p className="section-description">
          AirStride began with a simple truth: running is freedom, but only if your body moves in harmony with your breath. We watched countless joggers struggle with endurance not because of strength — but because of breathing.
        </p>
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


      {/* MODAL */}
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