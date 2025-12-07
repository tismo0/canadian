/**
 * QR Code generation and verification utilities
 * Uses HMAC signing for secure QR codes
 */

import QRCode from 'qrcode';
import crypto from 'crypto';

const SECRET_HMAC = process.env.SECRET_HMAC;

if (!SECRET_HMAC && typeof window === 'undefined') {
    console.warn('Missing SECRET_HMAC - QR code signing will not work');
}

/**
 * Generate a unique token for an order
 */
export function generateOrderToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create HMAC signature for order ID and token
 */
export function createOrderSignature(orderId: string, token: string): string {
    if (!SECRET_HMAC) {
        throw new Error('SECRET_HMAC not configured');
    }

    const payload = `${orderId}|${token}`;
    return crypto
        .createHmac('sha256', SECRET_HMAC)
        .update(payload)
        .digest('hex');
}

/**
 * Verify HMAC signature for QR code payload
 */
export function verifyOrderSignature(
    orderId: string,
    token: string,
    signature: string
): boolean {
    if (!SECRET_HMAC) {
        throw new Error('SECRET_HMAC not configured');
    }

    const expectedSignature = createOrderSignature(orderId, token);

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

/**
 * Generate QR code data payload string
 */
export function createQRPayload(orderId: string, token: string): string {
    const signature = createOrderSignature(orderId, token);
    return `${orderId}|${token}|${signature}`;
}

/**
 * Parse QR code payload string
 */
export function parseQRPayload(payload: string): {
    orderId: string;
    token: string;
    signature: string;
} | null {
    const parts = payload.split('|');

    if (parts.length !== 3) {
        return null;
    }

    return {
        orderId: parts[0],
        token: parts[1],
        signature: parts[2],
    };
}

/**
 * Generate QR code as data URI (for display in browser/email)
 */
export async function generateQRCodeDataURI(
    orderId: string,
    token: string,
    options?: {
        width?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
    }
): Promise<string> {
    const payload = createQRPayload(orderId, token);

    const qrOptions = {
        width: options?.width ?? 256,
        margin: options?.margin ?? 2,
        color: {
            dark: options?.color?.dark ?? '#000000',
            light: options?.color?.light ?? '#ffffff',
        },
        errorCorrectionLevel: 'H' as const, // High error correction for reliability
    };

    try {
        const dataURI = await QRCode.toDataURL(payload, qrOptions);
        return dataURI;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
    orderId: string,
    token: string
): Promise<string> {
    const payload = createQRPayload(orderId, token);

    try {
        const svg = await QRCode.toString(payload, {
            type: 'svg',
            margin: 2,
            errorCorrectionLevel: 'H',
        });
        return svg;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code SVG');
    }
}

/**
 * Validate and verify a scanned QR code
 */
export function validateQRCode(qrData: string): {
    valid: boolean;
    orderId?: string;
    error?: string;
} {
    const parsed = parseQRPayload(qrData);

    if (!parsed) {
        return {
            valid: false,
            error: 'Format QR code invalide',
        };
    }

    try {
        const isValid = verifyOrderSignature(
            parsed.orderId,
            parsed.token,
            parsed.signature
        );

        if (!isValid) {
            return {
                valid: false,
                error: 'Signature QR code invalide',
            };
        }

        return {
            valid: true,
            orderId: parsed.orderId,
        };
    } catch (error) {
        return {
            valid: false,
            error: 'Erreur de vérification',
        };
    }
}
