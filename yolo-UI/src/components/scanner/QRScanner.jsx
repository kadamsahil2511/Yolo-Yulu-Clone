import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flashlight, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { unlockBike } from '../../services/api';
import { mockBikes, createMockRide } from '../../services/mockData';

export default function QRScanner() {
    const { closeScanner, startRide, mockMode } = useApp();
    const [torch, setTorch] = useState(false);
    const [status, setStatus] = useState('scanning');
    const [message, setMessage] = useState('');
    const [manualInput, setManualInput] = useState(false);
    const [bikeCode, setBikeCode] = useState('');

    const handleScan = async (result) => {
        if (status !== 'scanning') return;

        const scannedText = result[0]?.rawValue;
        if (!scannedText) return;

        let bikeId = scannedText;
        if (scannedText.includes('bikeId=')) {
            const url = new URL(scannedText);
            bikeId = url.searchParams.get('bikeId');
        }

        await unlockWithBikeId(bikeId);
    };

    const unlockWithBikeId = async (bikeId) => {
        setStatus('success');
        setMessage(`Unlocking ${bikeId}...`);

        try {
            const ride = await unlockBike(bikeId);
            const bike = mockBikes.find(b => b.id === bikeId) || {
                id: bikeId,
                batteryLevel: 85,
                model: 'Yolo E-Bike'
            };

            setTimeout(() => {
                startRide(ride, bike);
            }, 1000);
        } catch (error) {
            setStatus('error');
            setMessage('Failed to unlock. Try again.');
            setTimeout(() => {
                setStatus('scanning');
                setMessage('');
            }, 2000);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (bikeCode.trim()) {
            unlockWithBikeId(bikeCode.toUpperCase());
        }
    };

    const handleMockScan = () => {
        const randomBike = mockBikes[Math.floor(Math.random() * mockBikes.length)];
        unlockWithBikeId(randomBike.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="scanner-overlay flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5">
                <button
                    onClick={closeScanner}
                    className="uber-floating-btn"
                    style={{ position: 'relative' }}
                >
                    <X className="w-5 h-5" />
                </button>

                <h1 className="text-title">Scan bike QR code</h1>

                <button
                    onClick={() => setTorch(!torch)}
                    className={`uber-floating-btn ${torch ? 'bg-[var(--color-yellow)]' : ''}`}
                    style={{ position: 'relative' }}
                >
                    <Flashlight className={`w-5 h-5 ${torch ? 'text-black' : ''}`} />
                </button>
            </div>

            {/* Scanner area */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
                <div className="relative w-full max-w-[280px] aspect-square">
                    {/* Scanner */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[var(--color-dark-card)]">
                        {status === 'scanning' && !manualInput && (
                            <Scanner
                                onScan={handleScan}
                                onError={(e) => console.log(e)}
                                constraints={{ facingMode: 'environment' }}
                                components={{ torch }}
                                styles={{
                                    container: { width: '100%', height: '100%' },
                                    video: { width: '100%', height: '100%', objectFit: 'cover' }
                                }}
                            />
                        )}
                    </div>

                    {/* Corners - Uber style */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white rounded-br-3xl" />

                    {/* Scan line */}
                    {status === 'scanning' && !manualInput && (
                        <motion.div
                            className="absolute left-6 right-6 h-0.5 bg-white"
                            initial={{ top: '15%' }}
                            animate={{ top: '85%' }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'linear'
                            }}
                            style={{ boxShadow: '0 0 12px rgba(255,255,255,0.5)' }}
                        />
                    )}

                    {/* Status overlays */}
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-[var(--color-green)] rounded-3xl"
                            >
                                <CheckCircle2 className="w-24 h-24 text-white" />
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-[var(--color-red)] rounded-3xl"
                            >
                                <AlertCircle className="w-24 h-24 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                <p className="mt-6 text-caption text-center">
                    {status === 'scanning' && 'Point camera at QR code on the bike handlebar'}
                    {status === 'success' && message}
                    {status === 'error' && message}
                </p>
            </div>

            {/* Bottom actions */}
            <div className="p-6 space-y-4">
                {/* Mock scan for testing */}
                {mockMode && status === 'scanning' && (
                    <button
                        onClick={handleMockScan}
                        className="uber-btn uber-btn-secondary w-full"
                    >
                        🧪 Test: Simulate scan
                    </button>
                )}

                {/* Manual input toggle */}
                <button
                    onClick={() => setManualInput(!manualInput)}
                    className="uber-btn uber-btn-secondary w-full"
                >
                    <Keyboard className="w-5 h-5" />
                    Enter code manually
                </button>

                {/* Manual input form */}
                <AnimatePresence>
                    {manualInput && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleManualSubmit}
                            className="flex gap-3 overflow-hidden"
                        >
                            <input
                                type="text"
                                value={bikeCode}
                                onChange={(e) => setBikeCode(e.target.value)}
                                placeholder="e.g. BIKE001"
                                className="flex-1 px-4 py-3 bg-[var(--color-dark-card)] rounded-xl text-white placeholder:text-[var(--color-text-muted)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="uber-btn uber-btn-primary px-6"
                            >
                                Unlock
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
