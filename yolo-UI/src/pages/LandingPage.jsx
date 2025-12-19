import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="landing-hero">
                <div className="landing-logo">
                    <span className="logo-icon">🚲</span>
                    <h1>YOLO</h1>
                </div>
                <p className="landing-tagline">Ride Anywhere. Anytime.</p>
                <p className="landing-description">
                    Unlock e-bikes instantly with just a scan.
                    Affordable, eco-friendly transportation at your fingertips.
                </p>
            </div>

            {/* Features */}
            <div className="landing-features">
                <div className="feature-card">
                    <span className="feature-icon">📍</span>
                    <h3>Find Nearby</h3>
                    <p>Locate bikes around you on the map</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">📱</span>
                    <h3>Scan & Ride</h3>
                    <p>Just scan the QR code to unlock</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">💰</span>
                    <h3>Pay Per Ride</h3>
                    <p>₹2/min with no hidden charges</p>
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="landing-cta">
                <button
                    className="btn-primary"
                    onClick={() => navigate('/auth')}
                >
                    Get Started
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/auth?mode=login')}
                >
                    I have an account
                </button>
            </div>

            {/* Footer */}
            <div className="landing-footer">
                <p>© 2024 YOLO Bike Sharing</p>
            </div>
        </div>
    );
}
