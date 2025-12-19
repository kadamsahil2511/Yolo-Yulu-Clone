import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import QRScanner from '../scanner/QRScanner';
import RideSheet from '../ride/RideSheet';
import { useApp } from '../../context/AppContext';
import { APP_STATES } from '../../types';

export default function MainLayout() {
    const { appState } = useApp();

    return (
        <div className="h-full w-full flex flex-col relative">
            {/* Main content area */}
            <main className="flex-1 overflow-hidden" style={{ paddingBottom: 'var(--nav-height)' }}>
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* QR Scanner Modal */}
            {appState === APP_STATES.SCANNING && <QRScanner />}

            {/* Ride Stats Bottom Sheet */}
            {appState === APP_STATES.RIDING && <RideSheet />}
        </div>
    );
}
