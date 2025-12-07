/**
 * Admin QR Scanner Page
 * Scan customer loyalty QR or order QR
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    QrCode,
    User,
    Star,
    Package,
    ArrowLeft,
    Plus,
    Check,
    Camera
} from 'lucide-react';
import Link from 'next/link';

export default function AdminScanPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanResult, setScanResult] = useState<any>(null);
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
        if (!isAdmin) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleManualScan = () => {
        if (!manualCode.trim()) return;

        try {
            // Try to parse as JSON (loyalty QR)
            const data = JSON.parse(manualCode);
            if (data.type === 'loyalty') {
                setScanResult({
                    type: 'loyalty',
                    userId: data.userId,
                    email: data.email,
                    points: Math.floor(Math.random() * 500), // Simulated current points
                });
            } else if (data.type === 'order') {
                setScanResult({
                    type: 'order',
                    orderId: data.orderId,
                    orderNumber: data.orderNumber,
                    status: data.status,
                });
            }
        } catch {
            // Treat as order token
            setScanResult({
                type: 'order',
                token: manualCode,
            });
        }
    };

    const handleAddPoints = () => {
        if (pointsToAdd <= 0) return;

        // Simulate adding points
        setSuccess(true);
        setTimeout(() => {
            setScanResult(null);
            setPointsToAdd(0);
            setManualCode('');
            setSuccess(false);
        }, 2000);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Scanner QR</h1>
                </div>

                {success ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card p-12 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-success-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Succès !</h2>
                        <p className="text-dark-400">{pointsToAdd} points ajoutés</p>
                    </motion.div>
                ) : scanResult ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6"
                    >
                        {scanResult.type === 'loyalty' ? (
                            <>
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-accent-400/10">
                                    <div className="w-14 h-14 rounded-full bg-accent-400/20 flex items-center justify-center">
                                        <User className="w-7 h-7 text-accent-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Client Fidélité</p>
                                        <p className="text-sm text-dark-400">{scanResult.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-dark-400">Points actuels</span>
                                    <span className="text-2xl font-bold text-accent-400 flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        {scanResult.points}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm text-dark-400">
                                        Points à ajouter (basé sur le total de commande)
                                    </label>
                                    <input
                                        type="number"
                                        value={pointsToAdd}
                                        onChange={(e) => setPointsToAdd(Number(e.target.value))}
                                        placeholder="Ex: 15 pour une commande de 15€"
                                        className="input"
                                        min={0}
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {[5, 10, 15, 25].map(pts => (
                                            <button
                                                key={pts}
                                                onClick={() => setPointsToAdd(pts)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                +{pts}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddPoints}
                                        disabled={pointsToAdd <= 0}
                                        className="btn btn-accent w-full"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Ajouter {pointsToAdd} points
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <Package className="w-12 h-12 text-accent-400 mx-auto mb-4" />
                                <p className="font-bold">Commande détectée</p>
                                <p className="text-dark-400">Token: {scanResult.token?.substring(0, 20)}...</p>
                                <Link href={`/admin/dashboard`} className="btn btn-primary mt-4">
                                    Voir dans le dashboard
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setScanResult(null);
                                setManualCode('');
                            }}
                            className="btn btn-ghost w-full mt-4"
                        >
                            Scanner un autre code
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Camera Scanner Placeholder */}
                        <div className="card p-8">
                            <div className="aspect-square bg-dark-900 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-accent-400/30">
                                <Camera className="w-16 h-16 text-accent-400/50 mb-4" />
                                <p className="text-dark-400 text-center">
                                    Scanner de caméra<br />
                                    <span className="text-sm">(Utilisez la saisie manuelle ci-dessous)</span>
                                </p>
                            </div>
                        </div>

                        {/* Manual Input */}
                        <div className="card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-accent-400" />
                                Saisie manuelle
                            </h3>
                            <div className="space-y-4">
                                <textarea
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder='Collez le contenu du QR code ici...'
                                    className="input min-h-[100px] resize-none"
                                />
                                <button
                                    onClick={handleManualScan}
                                    disabled={!manualCode.trim()}
                                    className="btn btn-accent w-full"
                                >
                                    <Check className="w-5 h-5" />
                                    Valider
                                </button>
                            </div>
                        </div>

                        {/* Quick Test */}
                        <div className="card p-4">
                            <p className="text-sm text-dark-400 mb-2">Test rapide (cliquez pour simuler)</p>
                            <button
                                onClick={() => {
                                    setScanResult({
                                        type: 'loyalty',
                                        userId: 'test-123',
                                        email: 'client@example.com',
                                        points: 127,
                                    });
                                }}
                                className="btn btn-outline btn-sm w-full"
                            >
                                Simuler un scan client fidélité
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
