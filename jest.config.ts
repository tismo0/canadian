/**
 * Jest configuration for Next.js
 */

import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    // Path to your Next.js app
    dir: './',
});

const config: Config = {
    // Test environment
    testEnvironment: 'jest-environment-jsdom',

    // Setup files to run before each test
    setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],

    // Module name mapping for path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.test.ts?(x)',
        '**/?(*.)+(spec|test).ts?(x)',
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Transform ignore patterns
    transformIgnorePatterns: [
        '/node_modules/',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
};

export default createJestConfig(config);
