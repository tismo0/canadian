/**
 * QRDisplay Component
 * Modern QR code display with light theme
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Copy, CheckCircle, QrCode } from 'lucide-react';

interface QRDisplayProps {
    qrDataUri: string;
    orderId: string;
    orderNumber?: number;
    size?: number;
}

export default function QRDisplay({
    qrDataUri,
    orderId,
    orderNumber,
    size = 256
}: QRDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = qrDataUri;
        link.download = `commande-${orderNumber || orderId.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [qrDataUri, orderId, orderNumber]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(orderId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }, [orderId]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
            data-testid="qr-display"
        >
            {/* QR Code Container */}
            <div className="qr-container">
                {/* QR Code Image */}
                <div className="relative rounded-lg overflow-hidden" style={{ width: size, height: size }}>
                    <Image
                        src={qrDataUri}
                        alt="QR Code de commande"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
            </div>

            {/* Order Info */}
            <div className="mt-6 text-center">
                {orderNumber && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4"
                    >
                        <p className="text-neutral-500 text-sm">Numéro de commande</p>
                        <p className="text-4xl font-display text-primary-600">
                            #{orderNumber.toString().padStart(4, '0')}
                        </p>
                    </motion.div>
                )}

                {/* Order ID with copy */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 justify-center"
                >
                    <code className="px-3 py-1.5 bg-neutral-100 rounded-lg text-sm font-mono text-neutral-600">
                        {orderId.slice(0, 8)}...
                    </code>
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors group"
                        aria-label="Copier l'ID de commande"
                    >
                        {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
                        )}
                    </button>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex gap-4"
            >
                <button
                    onClick={handleDownload}
                    className="btn-outline flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Télécharger
                </button>
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-accent-50 border border-accent-200 rounded-xl max-w-sm text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-accent-600" />
                    <span className="font-semibold text-neutral-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Comment récupérer
                    </span>
                </div>
                <ol className="text-sm text-neutral-600 text-left space-y-2">
                    <li className="flex gap-2">
                        <span className="text-primary-600 font-bold">1.</span>
                        Présentez ce QR code au comptoir
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary-600 font-bold">2.</span>
                        Notre équipe scannera votre code
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary-600 font-bold">3.</span>
                        Récupérez votre commande fraîche !
                    </li>
                </ol>
            </motion.div>
        </motion.div>
    );
}
