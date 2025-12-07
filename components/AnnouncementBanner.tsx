/**
 * Announcement Banner
 * Modern scrolling announcements with light theme
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
        const loadAnnouncements = () => {
            const saved = localStorage.getItem('admin_announcements');
            if (saved) {
                const all = JSON.parse(saved);
                setAnnouncements(all.filter((a: Announcement) => a.active));
            }
        };

        loadAnnouncements();
        window.addEventListener('storage', loadAnnouncements);
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer les annonces"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
