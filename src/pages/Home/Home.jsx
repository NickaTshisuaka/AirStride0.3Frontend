import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Local video files (will exist tomorrow)
  const videos = [
    "/videos/FEEL Embrace.mp4",
    "/videos/OAC.mp4",
    "/videos/vid3.mp4",
    "/videos/vid4.mp4", // slower
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      console.log("Video currentTime:", video.currentTime);

      if ( video.duration && video.duration - video.currentTime < 1.5) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    const handleVideoEnd = () => {
      console.log("Video ended. Switching to next video...");
      const next = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(next);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [currentVideoIndex, videos.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    console.log("Switching video to index:", currentVideoIndex, videos[currentVideoIndex]);
    video.src = videos[currentVideoIndex];
    video.load();

    video.playbackRate = currentVideoIndex === 3 ? 0.7 : 1;

    video
      .play()
      .catch((err) => console.error("Video play error:", err));
  }, [currentVideoIndex]);

  return (
    <main className="home-page">

      {/* HERO VIDEO SECTION */}
      <section className="hero-section">

        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          playsInline
        />

        <div className="hero-overlay" />

        <div className={`brand-cover ${showOverlay ? "visible" : ""}`}>
          <span>AIRSTRIDE</span>
        </div>

        <div className="hero-content">

          {/* added new text */}

          <div className="hero-label">
            <span className="pulse-dot" />
            NEXT GENERATION PERFORMANCE
          </div>

          <h1>
            BREATHE
            <span>BEYOND</span>
            LIMITS.
          </h1>

          <p>
            Breathing technology engineered for runners who
            refuse to slow down.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => navigate("/products")}
            >
              Explore Products
              <span>&#8594;</span>
            </button>

            <button
              className="text-btn"
              onClick={() => navigate("/about")}
            >
              Discover AirStride
            </button>
          </div>

        </div>

        <div className="hero-stats">

          <div>
            <strong>01</strong>
            <span>BREATHING<br />TECHNOLOGY</span>
          </div>

          <div>
            <strong>24/7</strong>
            <span>PERFORMANCE<br />ENGINEERED</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>KEEP<br />MOVING</span>
          </div>

        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>

      </section>


      {/* INTRO PARALLAX */}
      <section className="parallax parallax-one">

        <div className="parallax-shade" />

        <div className="parallax-content">

          <span className="eyebrow">THE AIRSTRIDE DIFFERENCE</span>

          <h2>
            Performance
            <br />
            starts with
            <em> every breath.</em>
          </h2>

          <p>
            Developed around the relationship between movement,
            airflow and endurance. AirStride technology is designed
            to work with your body rather than against it.
          </p>

          <div className="line-accent" />

        </div>

        <div className="parallax-number">
          01
        </div>

      </section>


      {/* FEATURES */}
      <section className="info-section">

        <div className="section-heading">

          <span className="eyebrow">ENGINEERED FOR MOTION</span>

          <h2>
            Built for the
            <span> next mile.</span>
          </h2>

          <p>
            Every detail has a purpose. Every component is designed
            around the athlete.
          </p>

        </div>

        <div className="info-grid">

          <article className="info-card">

            <div className="card-number">01</div>

            <div className="card-icon">
              ◌
            </div>

            <h3>Advanced Airflow</h3>

            <p>
              Engineered airflow channels designed to support
              controlled and consistent breathing during movement.
            </p>

            <span className="card-link">
              AIRFLOW SYSTEM &#8594;
            </span>

          </article>


          <article className="info-card featured-card">

            <div className="card-number">02</div>

            <div className="card-icon">
              ◇
            </div>

            <h3>Ultra Lightweight</h3>

            <p>
              Lightweight materials designed to stay comfortable
              while you focus on your performance.
            </p>

            <span className="card-link">
              MATERIAL SCIENCE &#8594;
            </span>

          </article>


          <article className="info-card">

            <div className="card-number">03</div>

            <div className="card-icon">
              ∞
            </div>

            <h3>Endurance Support</h3>

            <p>
              Performance-focused engineering built around your
              natural breathing rhythm and movement.
            </p>

            <span className="card-link">
              PERFORMANCE &#8594;
            </span>

          </article>

        </div>

      </section>


      {/* SECOND PARALLAX */}
      <section className="parallax parallax-two">

        <div className="parallax-shade" />

        <div className="parallax-content right-content">

          <span className="eyebrow">TECHNOLOGY IN MOTION</span>

          <h2>
            Your pace.
            <br />
            Your rhythm.
            <br />
            <em>Your advantage.</em>
          </h2>

          <p>
            AirStride technology is designed to move naturally
            with you, adapting to the demands of every run.
          </p>

          <button
            className="outline-btn"
            onClick={() => navigate("/products")}
          >
            View Technology
            <span>&#8594;</span>
          </button>

        </div>

        <div className="parallax-number">
          02
        </div>

      </section>


      {/* PERFORMANCE STRIP */}
      <section className="performance-section">

        <div className="performance-item">
          <span>01</span>
          <strong>MOVE</strong>
          <p>Natural movement without distraction.</p>
        </div>

        <div className="performance-item">
          <span>02</span>
          <strong>BREATHE</strong>
          <p>Designed around your breathing rhythm.</p>
        </div>

        <div className="performance-item">
          <span>03</span>
          <strong>PERFORM</strong>
          <p>Technology built for the next mile.</p>
        </div>

      </section>


      {/* FINAL CTA */}
      <section className="final-section">

        <div className="cta-glow" />

        <span className="eyebrow">THE FUTURE OF PERFORMANCE</span>

        <h2>
          Ready to
          <br />
          <span>move differently?</span>
        </h2>

        <p>
          Discover the technology behind AirStride and
          find the equipment built for your journey.
        </p>

        <div className="final-actions">

          <button
            className="primary-btn"
            onClick={() => navigate("/products")}
          >
            Explore Products
            <span>&#8594;</span>
          </button>

          <button
            className="outline-btn dark-btn"
            onClick={() => navigate("/about")}
          >
            About AirStride
          </button>

        </div>

      </section>

    </main>
  );
}