import { NavLink } from 'react-router-dom';
import { Home, History, User, ScanLine } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_STATES } from '../../types';

export default function BottomNav() {
    const { appState, openScanner } = useApp();

    // Hide nav when scanning
    if (appState === APP_STATES.SCANNING) {
        return null;
    }

    // Minimal nav when riding
    if (appState === APP_STATES.RIDING) {
        return null;
    }

    return (
        <nav className="uber-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `uber-nav-item ${isActive ? 'active' : ''}`}
            >
                <Home className="w-6 h-6" />
                <span>Home</span>
            </NavLink>

            {/* Center Scan Button */}
            <button
                onClick={openScanner}
                className="uber-btn uber-btn-primary uber-btn-icon"
                style={{ marginTop: '-20px' }}
            >
                <ScanLine className="w-6 h-6" />
            </button>

            <NavLink
                to="/rides"
                className={({ isActive }) => `uber-nav-item ${isActive ? 'active' : ''}`}
            >
                <History className="w-6 h-6" />
                <span>Activity</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) => `uber-nav-item ${isActive ? 'active' : ''}`}
            >
                <User className="w-6 h-6" />
                <span>Account</span>
            </NavLink>
        </nav>
    );
}
