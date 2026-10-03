import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const parallaxRefs = useRef([]);

  const videos = [
    "/videos/vid1.mp4",
    "/videos/vid2.mp4",
    "/videos/vid3.mp4",
    "/videos/vid4.mp4",
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  /* ================= VIDEO ================= */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (
        video.duration &&
        video.duration - video.currentTime < 1.5
      ) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    const handleVideoEnd = () => {
      setCurrentVideoIndex(
        (prev) => (prev + 1) % videos.length
      );
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [videos.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = videos[currentVideoIndex];

    video.playbackRate =
      currentVideoIndex === 3 ? 0.7 : 1;

    video.load();

    video
      .play()
      .catch(() => {});
  }, [currentVideoIndex]);

  /* ================= PARALLAX ================= */

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      parallaxRefs.current.forEach((section) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const speed = Number(section.dataset.speed) || 0.3;

        if (
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        ) {
          const offset =
            (window.innerHeight / 2 - (rect.top + rect.height / 2)) *
            speed;

          const background = section.querySelector(
            ".parallax-background"
          );

          if (background) {
            background.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ================= SCROLL REVEAL ================= */

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}

      <section className="hero-section">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          playsInline
          preload="auto"
        />

        <div className="hero-overlay" />

        <div
          className={`brand-cover ${
            showOverlay ? "visible" : ""
          }`}
        >
          <span>AirStride</span>
        </div>

        <div className="hero-text">
          <span className="hero-tag">
            NEXT GENERATION RUNNING TECHNOLOGY
          </span>

          <h1>
            Run Further.
            <br />
            <span>Breathe Better.</span>
          </h1>

          <p>
            Breathing technology engineered to move
            naturally with every stride.
          </p>

          <div className="hero-buttons">
            <button
              className="explore-btn"
              onClick={() => navigate("/products")}
            >
              Explore Products
              <span>→</span>
            </button>

            <button
              className="learn-btn"
              onClick={() => navigate("/about")}
            >
              Discover AirStride
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ================= INTRO ================= */}

      <section className="intro-section">
        <div className="intro-inner reveal">
          <span className="eyebrow">
            ENGINEERED FOR MOVEMENT
          </span>

          <h2>
            Your body has a rhythm.
            <br />
            <span>AirStride moves with it.</span>
          </h2>

          <p>
            We combine airflow engineering, lightweight
            materials and movement-focused design to create
            running technology built around the way athletes
            actually move.
          </p>
        </div>
      </section>

      {/* ================= PARALLAX ONE ================= */}

      <section
        className="parallax-section"
        data-speed="0.32"
        ref={(el) => (parallaxRefs.current[0] = el)}
      >
        <div
          className="parallax-background parallax-one"
        />

        <div className="parallax-overlay" />

        <div className="parallax-content reveal">
          <span className="eyebrow light">
            01 / PERFORMANCE
          </span>

          <h2>
            Performance meets
            <br />
            breathing science.
          </h2>

          <p>
            Designed around natural breathing patterns,
            AirStride creates a lightweight airflow experience
            that supports your movement without getting in
            your way.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="text-button"
          >
            Explore the technology →
          </button>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="features-section">
        <div className="section-heading reveal">
          <span className="eyebrow">
            THE AIRSTRIDE DIFFERENCE
          </span>

          <h2>
            Technology designed
            <br />
            around <span>you.</span>
          </h2>
        </div>

        <div className="feature-grid">

          <article className="feature-card reveal">
            <div className="feature-number">01</div>

            <div className="feature-icon">◉</div>

            <h3>Advanced Airflow</h3>

            <p>
              Engineered airflow channels designed to
              complement your natural breathing rhythm
              while you move.
            </p>

            <span className="feature-line" />
          </article>

          <article className="feature-card reveal delay-1">
            <div className="feature-number">02</div>

            <div className="feature-icon">◇</div>

            <h3>Lightweight Comfort</h3>

            <p>
              Lightweight materials and breathable
              construction keep the focus on your run,
              not your equipment.
            </p>

            <span className="feature-line" />
          </article>

          <article className="feature-card reveal delay-2">
            <div className="feature-number">03</div>

            <div className="feature-icon">↗</div>

            <h3>Built For Endurance</h3>

            <p>
              Designed for athletes who want equipment
              that feels natural from the first kilometre
              to the last.
            </p>

            <span className="feature-line" />
          </article>

        </div>
      </section>

      {/* ================= PARALLAX TWO ================= */}

      <section
        className="parallax-section parallax-second"
        data-speed="0.26"
        ref={(el) => (parallaxRefs.current[1] = el)}
      >
        <div
          className="parallax-background parallax-two"
        />

        <div className="parallax-overlay" />

        <div className="parallax-content right reveal">
          <span className="eyebrow light">
            02 / MOVEMENT
          </span>

          <h2>
            Technology that
            <br />
            moves with you.
          </h2>

          <p>
            Every detail is considered around movement,
            comfort and consistency so you can concentrate
            on the road ahead.
          </p>

          <button
            onClick={() => navigate("/about")}
            className="text-button"
          >
            Learn about AirStride →
          </button>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section className="stats-section">
        <div className="stats-grid">

          <div className="stat reveal">
            <strong>01</strong>
            <span>Purpose-built technology</span>
          </div>

          <div className="stat reveal delay-1">
            <strong>24/7</strong>
            <span>Designed around movement</span>
          </div>

          <div className="stat reveal delay-2">
            <strong>∞</strong>
            <span>Built for every stride</span>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="final-section">
        <div className="final-inner reveal">

          <span className="eyebrow">
            YOUR NEXT STRIDE STARTS HERE
          </span>

          <h2>
            Ready to change
            <br />
            <span>the way you run?</span>
          </h2>

          <p>
            Discover the technology, people and ideas
            behind AirStride.
          </p>

          <div className="final-buttons">

            <button
              className="cta-bottom"
              onClick={() => navigate("/products")}
            >
              Explore Products
              <span>→</span>
            </button>

            <button
              className="about-button"
              onClick={() => navigate("/about")}
            >
              About AirStride
            </button>

          </div>

        </div>
      </section>

    </main>
  );
}