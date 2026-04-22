import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';
import {
    applySerializableAppState,
    getSerializableAppState,
    onAppStateChange,
} from './storage.js';
import {
    applyFrequenciaData,
    getFrequenciaData,
    onFrequenciaChange,
} from './dashboard.js';
import { getCurrentUser, onUserChanged } from './auth.js';

let suppressSync = false;
let syncTimer = null;
let unsubscribeSnapshot = null;
let unsubscribeState = null;
let unsubscribeFrequencia = null;

function getCloudConfig() {
    return window.__POMODASH_FIREBASE__ || { enabled: false };
}

function getWorkspaceId(config, user) {
    const fromUrl = new URLSearchParams(window.location.search).get('workspace');
    return fromUrl || config.workspaceId || user.uid;
}

function updateCloudStatus(label, tone = 'idle') {
    const el = document.getElementById('cloudStatus');
    if (!el) return;
    el.textContent = label;
    el.dataset.tone = tone;
}

function buildCloudPayload(workspaceId) {
    return {
        workspaceId,
        appState: getSerializableAppState(),
        frequenciaData: getFrequenciaData(),
        updatedAt: serverTimestamp(),
    };
}

function applyRemotePayload(payload, rerender) {
    suppressSync = true;
    try {
        if (payload?.appState) applySerializableAppState(payload.appState);
        if (payload?.frequenciaData) applyFrequenciaData(payload.frequenciaData);
        rerender();
    } finally {
        suppressSync = false;
    }
}

export async function initCloudSync({ rerender }) {
    const config = getCloudConfig();
    if (!config.enabled || !config.firebase) {
        updateCloudStatus('Nuvem desativada', 'idle');
        return;
    }

    const app = initializeApp(config.firebase, 'cloud-sync');
    const db = getFirestore(app);

    const connectForUser = async user => {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        if (unsubscribeState) unsubscribeState();
        if (unsubscribeFrequencia) unsubscribeFrequencia();

        if (!user) {
            updateCloudStatus('Faça login para sincronizar', 'idle');
            return;
        }

        const workspaceId = getWorkspaceId(config, user);
        const ref = doc(db, 'workspaces', workspaceId);
        updateCloudStatus(`Nuvem: ${user.email || workspaceId}`, 'loading');

        const pushState = () => {
            if (suppressSync) return;
            clearTimeout(syncTimer);
            syncTimer = setTimeout(async () => {
                try {
                    updateCloudStatus(`Sincronizando: ${user.email || workspaceId}`, 'loading');
                    await setDoc(ref, buildCloudPayload(workspaceId), { merge: true });
                    updateCloudStatus(`Nuvem: ${user.email || workspaceId}`, 'ready');
                } catch (e) {
                    console.warn(e);
                    updateCloudStatus('Erro na nuvem', 'error');
                }
            }, 500);
        };

        unsubscribeState = onAppStateChange(pushState);
        unsubscribeFrequencia = onFrequenciaChange(pushState);

        const existing = await getDoc(ref);
        if (!existing.exists()) {
            await setDoc(ref, buildCloudPayload(workspaceId), { merge: true });
            updateCloudStatus(`Nuvem: ${user.email || workspaceId}`, 'ready');
        } else {
            applyRemotePayload(existing.data(), rerender);
            updateCloudStatus(`Nuvem: ${user.email || workspaceId}`, 'ready');
        }

        unsubscribeSnapshot = onSnapshot(
            ref,
            snapshot => {
                if (!snapshot.exists() || suppressSync) return;
                applyRemotePayload(snapshot.data(), rerender);
                updateCloudStatus(`Nuvem: ${user.email || workspaceId}`, 'ready');
            },
            error => {
                console.warn(error);
                updateCloudStatus('Erro na nuvem', 'error');
            },
        );
    };

    await connectForUser(getCurrentUser());
    onUserChanged(connectForUser);
}
