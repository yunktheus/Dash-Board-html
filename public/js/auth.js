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

function gateGoogleButtonContent(label) {
    return '<span class="google-mark" aria-hidden="true"><span class="g-blue">G</span></span><span>' + label + '</span>';
}

function setAuthGateVisible(visible) {
    document.body.classList.toggle('auth-locked', visible);
}

function updateAuthUI(user) {
    const statusEl = document.getElementById('authStatus');
    const btn = document.getElementById('authToggleBtn');
    const gateStatus = document.getElementById('authGateStatus');
    const gateBtn = document.getElementById('authGateBtn');
    if (!statusEl || !btn || !gateStatus || !gateBtn) return;

    if (user) {
        statusEl.textContent = user.displayName || user.email || 'Conectado';
        btn.innerHTML = '<span class="nav-item-icon"><i class="fas fa-right-from-bracket" aria-hidden="true"></i></span><span>Sair</span>';
        btn.setAttribute('aria-label', 'Sair da conta');
        gateStatus.textContent = `Conectado como ${user.displayName || user.email || 'usuário'}`;
        gateBtn.innerHTML = '<i class="fas fa-circle-check" aria-hidden="true"></i><span>Acesso liberado</span>';
        gateBtn.disabled = true;
        setAuthGateVisible(false);
    } else {
        statusEl.textContent = 'Login necessário';
        btn.innerHTML = '<span class="nav-item-icon"><i class="fab fa-google" aria-hidden="true"></i></span><span>Entrar com Google</span>';
        btn.setAttribute('aria-label', 'Entrar com Google');
        gateStatus.textContent = 'Entre com Google para liberar o painel.';
        gateBtn.innerHTML = gateGoogleButtonContent('Entrar com Google');
        gateBtn.disabled = false;
        setAuthGateVisible(true);
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
    setAuthGateVisible(true);
    updateAuthUI(null);

    if (!config.enabled || !config.firebase) {
        const gateStatus = document.getElementById('authGateStatus');
        if (gateStatus) gateStatus.textContent = 'Firebase ainda não configurado para autenticação.';
        return null;
    }

    const app = initializeApp(config.firebase, 'auth-app');
    authInstance = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const handleAuthAction = async () => {
        try {
            if (authInstance.currentUser) {
                await signOut(authInstance);
                return;
            }
            await signInWithPopup(authInstance, provider);
        } catch (error) {
            console.warn(error);
            const gateStatus = document.getElementById('authGateStatus');
            if (gateStatus) {
                gateStatus.textContent = 'Não foi possível entrar agora. Verifique o provedor Google e o domínio autorizado.';
            }
        }
    };

    document.getElementById('authToggleBtn')?.addEventListener('click', handleAuthAction);
    document.getElementById('authGateBtn')?.addEventListener('click', handleAuthAction);

    return new Promise(resolve => {
        onAuthStateChanged(authInstance, user => {
            currentUser = user;
            updateAuthUI(user);
            emitAuthChange(user);
            resolve(user);
        });
    });
}
