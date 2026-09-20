/**
 * firebase-auth.js
 * Firebase Phone OTP authentication for the RGR Plastics enquiry form.
 * Depends on: window.RGR_CONFIG (config.js loaded first),
 *             Firebase compat SDK v10 loaded via CDN in index.html.
 */

(function () {
    'use strict';

    // ─── State ───────────────────────────────────────────────────────────────

    const state = {
        app: null,
        auth: null,
        recaptchaVerifier: null,
        confirmationResult: null,
        idToken: null,
        verifiedPhone: null,   // E.164 number that was verified, e.g. "+919876543210"
        isVerified: false,
        isSending: false,
        isConfirming: false,
    };

    // Expose a read-only view to app.js
    window.RGR_FIREBASE_AUTH = {
        get isVerified() { return state.isVerified; },
        get idToken() { return state.idToken; },
        get verifiedPhone() { return state.verifiedPhone; },
        sendOtp,
        verifyOtp,
        resetVerification,
        refreshToken,
    };

    // ─── Initialise Firebase App ──────────────────────────────────────────────

    function initFirebase() {
        if (state.app) return state.app;

        const cfg = window.RGR_CONFIG || {};
        if (!cfg.firebaseApiKey || cfg.firebaseApiKey.startsWith('YOUR_')) {
            console.warn('[firebase-auth] Firebase keys are not configured in config.js — OTP disabled.');
            return null;
        }

        state.app = firebase.initializeApp({
            apiKey: cfg.firebaseApiKey,
            authDomain: cfg.firebaseAuthDomain,
            projectId: cfg.firebaseProjectId,
            appId: cfg.firebaseAppId,
        });

        state.auth = firebase.auth();
        state.auth.languageCode = 'en';
        return state.app;
    }

    // ─── reCAPTCHA Verifier ───────────────────────────────────────────────────

    function clearRecaptcha() {
        if (state.recaptchaVerifier) {
            try {
                state.recaptchaVerifier.clear();
            } catch (_) { /* ignore */ }
            state.recaptchaVerifier = null;
        }
        const container = document.getElementById('firebase-recaptcha-container');
        if (container) container.innerHTML = '';
    }

    function ensureRecaptcha() {
        if (state.recaptchaVerifier) return state.recaptchaVerifier;

        state.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'firebase-recaptcha-container',
            {
                size: 'invisible',
                callback: () => { /* reCAPTCHA solved, OTP request may proceed */ },
                'expired-callback': () => {
                    clearRecaptcha();
                },
            },
            state.app
        );

        return state.recaptchaVerifier;
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Send OTP to the given E.164 phone number (e.g. "+919876543210").
     * @param {string} e164Phone
     * @returns {Promise<void>}
     */
    async function sendOtp(e164Phone) {
        if (!initFirebase()) throw new Error('Firebase is not configured.');
        if (state.isSending) throw new Error('OTP send already in progress.');

        state.isSending = true;
        resetVerification(/* keepPhone */ false);

        try {
            const verifier = ensureRecaptcha();
            state.confirmationResult = await state.auth.signInWithPhoneNumber(e164Phone, verifier);
        } catch (err) {
            clearRecaptcha();
            throw err;
        } finally {
            state.isSending = false;
        }
    }

    /**
     * Confirm the OTP the user typed.
     * @param {string} otp  6-digit code
     * @returns {Promise<firebase.User>}
     */
    async function verifyOtp(otp) {
        if (!state.confirmationResult) throw new Error('Please request an OTP first.');
        if (state.isConfirming) throw new Error('Confirmation already in progress.');

        state.isConfirming = true;
        try {
            const result = await state.confirmationResult.confirm(otp);
            const user = result.user;
            state.idToken = await user.getIdToken();
            state.verifiedPhone = user.phoneNumber;
            state.isVerified = true;
            return user;
        } finally {
            state.isConfirming = false;
        }
    }

    /**
     * Refresh the Firebase ID token (tokens expire after 1 hour).
     * @returns {Promise<string>} fresh token
     */
    async function refreshToken() {
        if (!state.auth?.currentUser) return null;
        state.idToken = await state.auth.currentUser.getIdToken(/* forceRefresh */ true);
        return state.idToken;
    }

    /**
     * Reset verification state (e.g. when the user changes the mobile number).
     * @param {boolean} keepPhone  if true, keep verifiedPhone for comparison
     */
    function resetVerification(keepPhone = false) {
        state.confirmationResult = null;
        state.isVerified = false;
        state.idToken = null;
        if (!keepPhone) state.verifiedPhone = null;
        clearRecaptcha();
    }

    // Auto-initialise on load so the SDK warms up early
    document.addEventListener('DOMContentLoaded', () => {
        try { initFirebase(); } catch (_) { /* non-blocking */ }
    });

}());

