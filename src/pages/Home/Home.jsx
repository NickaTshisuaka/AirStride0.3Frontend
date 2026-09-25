import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Local video files (will exist tomorrow)
  const videos = [
    "/videos/vid1.mp4",
    "/videos/vid2.mp4",
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
      if (video.duration - video.currentTime < 1.5) {
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

    // Slow down the 4th video
    if (currentVideoIndex === 3) {
      video.playbackRate = 0.7;
      console.log("Slowing down 4th video");
    } else {
      video.playbackRate = 1.0;
    }

    video
      .play()
      .then(() => console.log("Video playing"))
      .catch((err) => console.error("Video play error:", err));
  }, [currentVideoIndex, videos]);

  return (
    <div className="home-page">
      {/* HERO VIDEO SECTION */}
      <section className="hero-section">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          playsInline
        />

        <div className={`brand-cover ${showOverlay ? "visible" : ""}`}>
          <h1>AirStride</h1>
        </div>

        <div className="hero-text">
          <h1 className="title">AirStride</h1>
          <p className="subtitle">Breathing technology built for runners.</p>
          <button
            className="explore-btn"
            onClick={() => navigate("/products")}
          >
            Explore Products
          </button>
        </div>
      </section>

      {/* PARALLAX 1 */}
      <section className="parallax parallax-one">
        <div className="parallax-content fade-in">
          <h2>Performance Meets Breathing Science</h2>
          <p>
            Developed with biomechanical research, AirStride enhances lung
            efficiency using lightweight airflow engineering designed to adapt
            to your natural movement patterns.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="info-section">
        <h2 className="section-title">Why Athletes Choose AirStride</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Advanced Airflow Control</h3>
            <p>Optimized oxygen uptake and steady breathing during long runs.</p>
          </div>
          <div className="info-card">
            <h3>Lightweight Comfort</h3>
            <p>Designed with premium breathable materials that reduce fatigue.</p>
          </div>
          <div className="info-card">
            <h3>Smart Endurance Support</h3>
            <p>Backed by sports science to improve stamina and recovery time.</p>
          </div>
        </div>
      </section>

      {/* PARALLAX 2 */}
      <section className="parallax parallax-two">
        <div className="parallax-content fade-in delay">
          <h2>Technology That Moves With You</h2>
          <p>
            Every stride activates micro-air channels that adapt to your pace,
            temperature, and breathing rhythm.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-section">
        <h2>Ready to Upgrade Your Run?</h2>
        <p>Experience the next generation of breathing performance gear.Learn More about who weare and what we stand for here at AirStride</p>
        <button
          className="cta-bottom"
          onClick={() => navigate("/about")}
        >
          About Us
        </button>
      </section>
    </div>
  );
}
