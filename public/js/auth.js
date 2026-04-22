import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

let authInstance = null;
let currentUser = null;
const authListeners = new Set();

function getConfig() {
    return window.__POMODASH_FIREBASE__ || { enabled: false };
}

function updateAuthUI(user) {
    const statusEl = document.getElementById('authStatus');
    const btn = document.getElementById('authToggleBtn');
    if (!statusEl || !btn) return;

    if (user) {
        statusEl.textContent = user.displayName || user.email || 'Conectado';
        btn.innerHTML = '<span class="nav-item-icon"><i class="fas fa-right-from-bracket" aria-hidden="true"></i></span><span>Sair</span>';
        btn.setAttribute('aria-label', 'Sair da conta');
    } else {
        statusEl.textContent = 'Login necessário';
        btn.innerHTML = '<span class="nav-item-icon"><i class="fab fa-google" aria-hidden="true"></i></span><span>Entrar com Google</span>';
        btn.setAttribute('aria-label', 'Entrar com Google');
    }
}

function emitAuthChange(user) {
    authListeners.forEach(listener => {
        try {
            listener(user);
        } catch (e) {
            console.warn(e);
        }
    });
}

export function getCurrentUser() {
    return currentUser;
}

export function onUserChanged(listener) {
    authListeners.add(listener);
    return () => authListeners.delete(listener);
}

export async function initAuth() {
    const config = getConfig();
    updateAuthUI(null);

    if (!config.enabled || !config.firebase) {
        return null;
    }

    const app = initializeApp(config.firebase, 'auth-app');
    authInstance = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    document.getElementById('authToggleBtn')?.addEventListener('click', async () => {
        try {
            if (authInstance.currentUser) {
                await signOut(authInstance);
                return;
            }
            await signInWithPopup(authInstance, provider);
        } catch (error) {
            console.warn(error);
        }
    });

    return new Promise(resolve => {
        onAuthStateChanged(authInstance, user => {
            currentUser = user;
            updateAuthUI(user);
            emitAuthChange(user);
            resolve(user);
        });
    });
}
