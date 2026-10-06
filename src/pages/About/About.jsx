// src/pages/About/About.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaLightbulb, FaHeartbeat, FaRunning, FaUsers, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./About.css";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 } };
const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8 } };

export default function AboutPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [ceoModal, setCeoModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !videoRef.current) return;
      const scrollY = window.scrollY;
      videoRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="about-page">

      {/* HERO */}
      <header className="hero" ref={heroRef}>
        <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline>
          <source src="/bokke.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <motion.div {...fadeUp} className="hero-inner" viewport={{ once: true }}>
          <h1>About AirStride</h1>
          <p className="subtitle">Helping joggers breathe better, run further, and live healthier.</p>
          <button className="hero-cta" onClick={() => navigate("/products")}>Explore Products</button>
        </motion.div>
      </header>

      {/* STORY */}
      <section className="story-section">
        <motion.div className="story-media" {...fadeIn} viewport={{ once: true }}>
          <img src="/selfieGirls.jpeg" alt="AirStride story" />
        </motion.div>

        <motion.article className="story-text" {...fadeUp} viewport={{ once: true }}>
          <h2>Our Story</h2>
          <p>
            AirStride began with a simple truth: running is freedom, but only if your body moves in harmony with your breath.
            We watched countless joggers struggle with endurance not because of strength — but because of breathing. That inspired
            us to design tools that help people reconnect with their rhythm and unlock the joy of effortless movement.
          </p>
          <p>
            Today, AirStride continues that mission by blending research, innovation, and heart. Every product we make exists
            for one purpose: helping you breathe easier, run further, and feel more alive.
          </p>
          <button className="cta-btn" onClick={() => navigate("/products")}>Explore Products</button>
        </motion.article>
      </section>

      {/* VALUES */}
      <section className="values-section">
        <h2 className="section-title">Our Values</h2>
        <div className="values-grid">
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
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="team-section">
        <h2 className="section-title">Meet the Team</h2>
        <div className="team-grid">

          {/* 1 - GLORIA */}
          <motion.div className="team-card" {...fadeUp} viewport={{ once: true }}>
            <div className="team-img-wrap"><img src="/gloria.jpeg" alt="Gloria Ngonda" /></div>
            <h4>Gloria Ngonda</h4>
            <p className="role">Breathing Science Researcher</p>
            <p className="bio">
              Gloria is the heartbeat of our research team. With a background in respiratory biomechanics,
              she transforms raw data into life-changing insights. Her passion lies in helping everyday athletes
              understand their breath — and use it as a powerful tool for endurance.
            </p>
          </motion.div>

          {/* 2 - KEREN */}
          <motion.div className="team-card" {...fadeUp} transition={{ delay: 0.12 }} viewport={{ once: true }}>
            <div className="team-img-wrap"><img src="/keren.jpeg" alt="Keren Botombe" /></div>
            <h4>Keren Botombe</h4>
            <p className="role">Fitness & Endurance Specialist</p>
            <p className="bio">
              Keren brings a deeply human touch to training science. She has coached countless runners to
              push past limits with confidence and calm breathing. Her empathy, strength, and discipline
              shape many of AirStride’s training principles.
            </p>
          </motion.div>

          {/* 3 - TEGRA */}
          <motion.div className="team-card" {...fadeUp} transition={{ delay: 0.24 }} viewport={{ once: true }}>
            <div className="team-img-wrap"><img src="/tegra.jpeg" alt="Tegra Mungundi" /></div>
            <h4>Tegra Mungundi</h4>
            <p className="role">Lead Developer</p>
            <p className="bio">
              Tegra is the mind behind the tech magic. With a love for clean design and fast, reliable systems,
              he ensures AirStride’s digital experience is seamless from start to finish. His work turns ideas
              into tools people rely on every day.
            </p>
          </motion.div>

          {/* 4 - TRACY */}
          <motion.div className="team-card" {...fadeUp} transition={{ delay: 0.36 }} viewport={{ once: true }}>
            <div className="team-img-wrap"><img src="/tracy.jpeg" alt="Tracy Bebel" /></div>
            <h4>Tracy Bebel</h4>
            <p className="role">Product Designer</p>
            <p className="bio">
              Tracy blends creativity with purpose. Every curve, material, and interaction in our products
              reflects her deep belief that design should feel natural, empowering, and inspiring. She builds
              products that feel like they belong to you.
            </p>
          </motion.div>

          {/* 5 - NEW TEAM MEMBER */}
          <motion.div className="team-card" {...fadeUp} transition={{ delay: 0.48 }} viewport={{ once: true }}>
            <div className="team-img-wrap"><img src="/cynthia.png" alt="Cynthia Bebel" /></div>
            <h4>Cynthia Bebel</h4>
            <p className="role">Operations & Logistics Lead</p>
            <p className="bio">
              Cynthia is the engine that keeps AirStride moving. From manufacturing to delivery,
              she ensures every product reaches runners with care and precision. Her dedication to
              consistency and quality makes her a quiet hero behind the scenes.
            </p>
          </motion.div>

        </div>
      </section>

      {/* CEO VIDEO SECTION */}
      <section className="ceo-section">
        <motion.div className="ceo-inner" {...fadeUp} viewport={{ once: true }}>
          <video className="ceo-video" autoPlay muted loop playsInline>
            <source src="/jonathan.mp4" type="video/mp4" />
          </video>
          <div className="ceo-text">
            <h3>A Message From Our Founder</h3>
            <h4>Jonathan Kabango</h4>
            <p>
              "AirStride isn’t just a company — it’s a promise. A promise that every runner deserves the
              freedom of full, easy breaths. My mission is to help people feel strong, confident, and connected
              to their own bodies in ways they never thought possible."
            </p>
            <button className="cta-btn" onClick={() => setCeoModal(true)}>Contact the Founder</button>
          </div>
        </motion.div>
      </section>

      {/* CEO MODAL */}
      {ceoModal && (
        <div className="ceo-modal">
          <div className="ceo-modal-content">
            <span className="modal-close" onClick={() => setCeoModal(false)}>&times;</span>
            <h2>Contact Jonanthan Kabango</h2>
            <p><strong>Phone:</strong> +27 71 123 4567</p>
            <p><strong>Email:</strong> jonathan.kabango@airstride.com</p>
            <div className="ceo-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
