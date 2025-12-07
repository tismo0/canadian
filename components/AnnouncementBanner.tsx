/**
 * Announcement Banner
 * Scrolling announcements bar at the top of the page
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Announcement {
    id: string;
    text: string;
    active: boolean;
}

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Load announcements from localStorage
        const loadAnnouncements = () => {
            const saved = localStorage.getItem('admin_announcements');
            if (saved) {
                const all = JSON.parse(saved);
                setAnnouncements(all.filter((a: Announcement) => a.active));
            }
        };

        loadAnnouncements();

        // Listen for storage changes (when admin updates)
        window.addEventListener('storage', loadAnnouncements);

        // Poll every 30 seconds
        const interval = setInterval(loadAnnouncements, 30000);

        return () => {
            window.removeEventListener('storage', loadAnnouncements);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible || announcements.length === 0) return null;

    return (
        <div className="announcement-bar relative overflow-hidden">
            <div className="py-2 px-4">
                <div className="announcement-scroll whitespace-nowrap">
                    {/* Duplicate for seamless loop */}
                    {[...announcements, ...announcements].map((announcement, index) => (
                        <span key={`${announcement.id}-${index}`} className="inline-flex items-center mx-8">
                            <span className="text-accent-400 mr-2">★</span>
                            <span className="text-sm font-medium">{announcement.text}</span>
                        </span>
                    ))}
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Fermer les annonces"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
