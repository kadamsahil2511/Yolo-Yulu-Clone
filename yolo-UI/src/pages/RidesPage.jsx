import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ChevronRight, Bike, Calendar } from 'lucide-react';
import { getRideHistory } from '../services/api';

export default function RidesPage() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('past');

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const data = await getRideHistory();
                setRides(data);
            } catch (error) {
                console.error('Failed to fetch rides:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRides();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (start, end) => {
        const duration = new Date(end) - new Date(start);
        const minutes = Math.floor(duration / 60000);
        return `${minutes} min`;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[var(--color-black)]">
            {/* Header */}
            <div className="p-6 pb-4">
                <h1 className="text-display mb-6">Activity</h1>

                {/* Tabs */}
                <div className="uber-pills">
                    <button
                        className={`uber-pill ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Past
                    </button>
                    <button
                        className={`uber-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            {/* Rides list */}
            <div className="px-6 pb-32">
                {rides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-dark-card)] flex items-center justify-center mb-6">
                            <Bike className="w-10 h-10 text-[var(--color-text-muted)]" />
                        </div>
                        <p className="text-title mb-2">No rides yet</p>
                        <p className="text-caption">Your ride history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rides.map((ride, index) => (
                            <motion.div
                                key={ride.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="uber-card cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="uber-list-icon">
                                        <Bike className="w-6 h-6 text-[var(--color-text-secondary)]" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{formatDate(ride.startTime)}</span>
                                            <span className="text-small">•</span>
                                            <span className="text-caption">{formatTime(ride.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-small">
                                            <span>{formatDuration(ride.startTime, ride.endTime)}</span>
                                            <span>•</span>
                                            <span>{ride.distance} km</span>
                                        </div>
                                    </div>

                                    {/* Price & arrow */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">₹{ride.cost}</span>
                                        <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
