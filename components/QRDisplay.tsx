/**
 * QRDisplay Component
 * Displays QR code for order pickup with download functionality
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Copy, CheckCircle, QrCode } from 'lucide-react';

interface QRDisplayProps {
    /** QR code as data URI (base64) */
    qrDataUri: string;
    /** Order ID for display */
    orderId: string;
    /** Order number for display */
    orderNumber?: number;
    /** Optional custom size */
    size?: number;
}

export default function QRDisplay({
    qrDataUri,
    orderId,
    orderNumber,
    size = 256
}: QRDisplayProps) {
    const [copied, setCopied] = useState(false);

    // Download QR code as image
    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = qrDataUri;
        link.download = `commande-${orderNumber || orderId.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [qrDataUri, orderId, orderNumber]);

    // Copy order ID to clipboard
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
            <div className="relative p-4 bg-white rounded-2xl shadow-xl">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary-600 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary-600 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary-600 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary-600 rounded-br-lg" />

                {/* QR Code Image */}
                <div className="relative" style={{ width: size, height: size }}>
                    <Image
                        src={qrDataUri}
                        alt="QR Code de commande"
                        fill
                        className="object-contain"
                        unoptimized // Data URI doesn't need optimization
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
                        <p className="text-dark-400 text-sm">Numéro de commande</p>
                        <p className="text-4xl font-bold text-accent-400">
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
                    <code className="px-3 py-1.5 bg-dark-800 rounded-lg text-sm font-mono text-dark-300">
                        {orderId.slice(0, 8)}...
                    </code>
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-dark-800 rounded-lg transition-colors group"
                        aria-label="Copier l'ID de commande"
                    >
                        {copied ? (
                            <CheckCircle className="w-4 h-4 text-success-500" />
                        ) : (
                            <Copy className="w-4 h-4 text-dark-400 group-hover:text-white" />
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
                className="mt-8 p-4 bg-dark-800/50 rounded-xl max-w-sm text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 text-accent-400" />
                    <span className="font-semibold">Comment récupérer votre commande</span>
                </div>
                <ol className="text-sm text-dark-400 text-left space-y-2">
                    <li className="flex gap-2">
                        <span className="text-accent-400 font-bold">1.</span>
                        Présentez ce QR code au comptoir
                    </li>
                    <li className="flex gap-2">
                        <span className="text-accent-400 font-bold">2.</span>
                        Notre équipe scannera votre code
                    </li>
                    <li className="flex gap-2">
                        <span className="text-accent-400 font-bold">3.</span>
                        Récupérez votre commande fraîchement préparée!
                    </li>
                </ol>
            </motion.div>
        </motion.div>
    );
}
