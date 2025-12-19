import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, X, ChevronUp, Navigation2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useRide } from '../../hooks/useRide';
import { endRide as endRideApi } from '../../services/api';

export default function RideSheet() {
    const { currentRide, selectedBike, endRide } = useApp();
    const { elapsedTime, estimatedCost, formatTime, batteryLevel } = useRide();
    const [isEnding, setIsEnding] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleEndRide = async () => {
        if (!currentRide) return;

        setIsEnding(true);
        try {
            await endRideApi(currentRide.id);
            endRide();
        } catch (error) {
            console.error('Failed to end ride:', error);
        } finally {
            setIsEnding(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="uber-sheet animate-slide-up"
            >
                {/* Handle */}
                <div
                    className="uber-sheet-handle cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                />

                {/* Live Status */}
                <div className="flex items-center justify-between mb-6">
                    <div className="uber-badge uber-badge-live">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-green)] pulse-dot" />
                        Ride in progress
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="uber-floating-btn w-10 h-10"
                        style={{ position: 'relative' }}
                    >
                        <ChevronUp className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Main Stats - Uber Style */}
                <div className="flex items-center justify-between mb-6">
                    {/* Time - Big Number */}
                    <div>
                        <p className="text-small mb-1">Duration</p>
                        <p className="text-display">{formatTime(elapsedTime)}</p>
                    </div>

                    {/* Cost */}
                    <div className="text-right">
                        <p className="text-small mb-1">Estimated fare</p>
                        <p className="text-display">₹{estimatedCost}</p>
                    </div>
                </div>

                {/* Battery indicator */}
                <div className="uber-card flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${batteryLevel > 50 ? 'bg-green-500/20' :
                            batteryLevel > 20 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                        }`}>
                        <Zap className={`w-6 h-6 ${batteryLevel > 50 ? 'text-green-400' :
                                batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'
                            }`} />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{selectedBike?.model || 'E-Bike'}</p>
                        <p className="text-small">{batteryLevel}% battery remaining</p>
                    </div>
                    <div className="text-right">
                        <p className="text-caption">₹2/min</p>
                    </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="uber-card flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
                                    <Navigation2 className="w-6 h-6 text-[var(--color-accent)]" />
                                </div>
                                <div>
                                    <p className="text-small">Started from</p>
                                    <p className="font-medium">Your current location</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* End Ride Button - Uber Style */}
                <button
                    onClick={handleEndRide}
                    disabled={isEnding}
                    className="uber-btn uber-btn-primary w-full"
                >
                    {isEnding ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Ending ride...
                        </span>
                    ) : (
                        'End ride'
                    )}
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
