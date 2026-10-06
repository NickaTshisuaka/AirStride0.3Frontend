import React, { useState } from 'react';
import { X } from 'lucide-react';
import './FindStore.css';

const FindStore = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const storeAddress = '14 Valda Street, Townsview, Johannesburg';

  const handleGetDirections = () => {
    setUserLocation(null);
    setLocationError(null);
    setShowPermissionModal(true);
  };

  const confirmPermission = () => {
    setShowPermissionModal(false);
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setIsGettingLocation(false);

        const mapsUrl =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${location.lat},${location.lng}` +
          `&destination=${encodeURIComponent(storeAddress)}`;

        window.open(mapsUrl, '_blank');
      },
      (error) => {
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              'You denied location access. Please check your browser settings.'
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;

          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;

          default:
            setLocationError('Could not get your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <main className="afs-find-store">

      {/* HERO */}
      <section className="afs-hero">
        <div className="afs-hero-overlay" />

        <div className="afs-hero-content">
          <h1 className="afs-hero-title">
            FIND A STORE
          </h1>
        </div>
      </section>


      {/* MAIN CONTENT */}
      <div className="afs-content">


        {/* WHO WE ARE */}
        <section className="afs-story afs-story--first">

          <div className="afs-story-media">
            <img
              src="/Ryzon_AW25_Lookbook_L1223032_lukaspiel_1_7ed0c316-dee3-492e-938b-397516960bb0.webp"
              alt="AirStride activewear"
              className="afs-story-image"
            />
          </div>

          <div className="afs-story-text">
            <h2 className="afs-story-heading">
              WHO WE ARE
            </h2>

            <p className="afs-story-description">
              AirStride began with a simple truth: running is freedom,
              but only if your body moves in harmony with your breath.
              We watched countless joggers struggle with endurance not
              because of strength — but because of breathing.
            </p>
          </div>

        </section>


        {/* WHY WE DO IT */}
        <section className="afs-story afs-story--second">

          <div className="afs-story-text">
            <h2 className="afs-story-heading">
              WHY WE DO IT
            </h2>

            <p className="afs-story-description">
              AirStride began with a simple truth: running is freedom,
              but only if your body moves in harmony with your breath.
              We watched countless joggers struggle with endurance not
              because of strength — but because of breathing.
            </p>
          </div>

          <div className="afs-story-media">
            <img
              src="/90.webp"
              alt="Runners in Johannesburg"
              className="afs-story-image"
            />
          </div>

        </section>


        {/* LOCATION */}
        <section className="afs-location">

          <h2 className="afs-location-title">
            LOCATION US
          </h2>

          <div className="afs-map-container">

            <iframe
              className="afs-map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                storeAddress
              )}&zoom=15&maptype=roadmap`}
              title="AirStride Store Location"
            />

            <button
              className="afs-directions-button"
              onClick={handleGetDirections}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? 'LOCATING...' : 'DIRECTIONS'}
            </button>

          </div>


          <div className="afs-store-details">
            <p>{storeAddress}</p>

            <p>
              Monday – Friday · 9:00 AM – 6:00 PM
            </p>

            <p>
              Saturday · 9:00 AM – 4:00 PM
            </p>
          </div>


          {locationError && (
            <div className="afs-location-error">

              <p>{locationError}</p>

              <button
                className="afs-retry-button"
                onClick={handleGetDirections}
              >
                TRY AGAIN
              </button>

            </div>
          )}

        </section>

      </div>


      {/* LOCATION PERMISSION MODAL */}
      {showPermissionModal && (
        <div className="afs-modal-backdrop">

          <div className="afs-location-modal">

            <button
              className="afs-modal-close"
              onClick={() => setShowPermissionModal(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <h2 className="afs-modal-title">
              ALLOW LOCATION ACCESS?
            </h2>

            <p className="afs-modal-description">
              We'll use your current location to show directions
              to our store in Google Maps. Your location data
              won't be stored or shared.
            </p>

            <div className="afs-modal-actions">

              <button
                className="afs-modal-allow"
                onClick={confirmPermission}
              >
                ALLOW
              </button>

              <button
                className="afs-modal-cancel"
                onClick={() => setShowPermissionModal(false)}
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
};

export default FindStore;
