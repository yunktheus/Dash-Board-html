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

let suppressSync = false;
let syncTimer = null;

function getCloudConfig() {
    return window.__POMODASH_FIREBASE__ || { enabled: false };
}

function getWorkspaceId(config) {
    const fromUrl = new URLSearchParams(window.location.search).get('workspace');
    const fromStorage = localStorage.getItem('pomodash_workspace_id');
    const workspaceId = fromUrl || fromStorage || config.workspaceId || 'default';
    localStorage.setItem('pomodash_workspace_id', workspaceId);
    return workspaceId;
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

    const workspaceId = getWorkspaceId(config);
    const app = initializeApp(config.firebase);
    const db = getFirestore(app);
    const ref = doc(db, 'workspaces', workspaceId);

    updateCloudStatus(`Nuvem: ${workspaceId}`, 'loading');

    const pushState = () => {
        if (suppressSync) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
            try {
                updateCloudStatus(`Sincronizando: ${workspaceId}`, 'loading');
                await setDoc(ref, buildCloudPayload(workspaceId), { merge: true });
                updateCloudStatus(`Nuvem: ${workspaceId}`, 'ready');
            } catch (e) {
                console.warn(e);
                updateCloudStatus('Erro na nuvem', 'error');
            }
        }, 500);
    };

    onAppStateChange(pushState);
    onFrequenciaChange(pushState);

    const existing = await getDoc(ref);
    if (!existing.exists()) {
        await setDoc(ref, buildCloudPayload(workspaceId), { merge: true });
        updateCloudStatus(`Nuvem: ${workspaceId}`, 'ready');
    } else {
        applyRemotePayload(existing.data(), rerender);
        updateCloudStatus(`Nuvem: ${workspaceId}`, 'ready');
    }

    onSnapshot(
        ref,
        snapshot => {
            if (!snapshot.exists() || suppressSync) return;
            applyRemotePayload(snapshot.data(), rerender);
            updateCloudStatus(`Nuvem: ${workspaceId}`, 'ready');
        },
        error => {
            console.warn(error);
            updateCloudStatus('Erro na nuvem', 'error');
        },
    );
}
