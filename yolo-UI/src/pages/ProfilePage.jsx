import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Wallet, Settings, ChevronRight,
    CreditCard, HelpCircle, Shield, Bell,
    ToggleLeft, ToggleRight, LogOut
} from 'lucide-react';
import { getUserProfile } from '../services/api';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { mockMode, toggleMockMode } = useApp();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserProfile();
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { icon: Wallet, label: 'Wallet', subtitle: `₹${user?.balance || 0} balance`, action: true },
        { icon: CreditCard, label: 'Payment methods', action: true },
        { icon: Bell, label: 'Notifications', action: true },
        { icon: Shield, label: 'Privacy', action: true },
        { icon: HelpCircle, label: 'Help', action: true },
    ];

    return (
        <div className="h-full overflow-y-auto bg-[var(--color-black)]">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center gap-4 mb-8">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-[var(--color-dark-card)] overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-[var(--color-text-muted)]" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-title">{user?.name || 'User'}</h1>
                        <p className="text-caption">{user?.email}</p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="uber-card text-center"
                    >
                        <p className="text-display mb-1">₹{user?.balance || 0}</p>
                        <p className="text-small">Wallet balance</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="uber-card text-center"
                    >
                        <p className="text-display mb-1">{user?.totalRides || 0}</p>
                        <p className="text-small">Total rides</p>
                    </motion.div>
                </div>
            </div>

            {/* Menu */}
            <div className="px-6">
                <div className="uber-card-elevated p-0 overflow-hidden">
                    {menuItems.map((item, index) => (
                        <div
                            key={item.label}
                            className="uber-list-item px-4 cursor-pointer hover:bg-[var(--color-dark-hover)] transition-colors"
                        >
                            <div className="uber-list-icon">
                                <item.icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                {item.subtitle && <p className="text-small">{item.subtitle}</p>}
                            </div>
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                        </div>
                    ))}
                </div>

                {/* Developer section */}
                <div className="mt-6 mb-4">
                    <p className="text-small uppercase tracking-wider px-1 mb-3">Developer</p>
                    <div className="uber-card-elevated p-0 overflow-hidden">
                        <div
                            className="uber-list-item px-4 cursor-pointer"
                            onClick={toggleMockMode}
                        >
                            <div className="uber-list-icon bg-yellow-500/20">
                                <Settings className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Mock Mode</p>
                                <p className="text-small">Test without backend</p>
                            </div>
                            {mockMode ? (
                                <ToggleRight className="w-8 h-8 text-[var(--color-green)]" />
                            ) : (
                                <ToggleLeft className="w-8 h-8 text-[var(--color-text-muted)]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <button className="uber-btn uber-btn-secondary w-full mt-4 mb-8">
                    <LogOut className="w-5 h-5" />
                    Sign out
                </button>

                {/* Version */}
                <p className="text-center text-small pb-32">
                    YOLO Bike Sharing • v1.0.0
                </p>
            </div>
        </div>
    );
}
