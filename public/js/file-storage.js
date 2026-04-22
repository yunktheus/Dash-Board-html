import { getCurrentUser } from './auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
    deleteObject,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const allowedMimeTypes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

function getConfig() {
    return window.__POMODASH_FIREBASE__ || { enabled: false };
}

function getStorageApp() {
    const config = getConfig();
    if (!config.enabled || !config.firebase) {
        throw new Error('Firebase não configurado para upload.');
    }
    return initializeApp(config.firebase, 'storage-app');
}

function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function validateFile(file) {
    if (!file) throw new Error('Selecione um arquivo para enviar.');
    if (file.size > MAX_FILE_SIZE) throw new Error('O arquivo excede o limite de 20 MB.');
    if (file.type && !allowedMimeTypes.has(file.type)) {
        throw new Error('Formato não permitido neste modo de teste.');
    }
}

export async function uploadBibliotecaFile(file) {
    const user = getCurrentUser();
    if (!user) throw new Error('Faça login para enviar arquivos.');

    validateFile(file);

    const app = getStorageApp();
    const storage = getStorage(app);
    const fileName = sanitizeName(file.name || `arquivo-${Date.now()}`);
    const path = `users/${user.uid}/library/${Date.now()}-${fileName}`;
    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
    });
    const url = await getDownloadURL(snapshot.ref);

    return {
        url,
        storagePath: path,
        cloudNote: 'Firebase Storage',
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        originalName: file.name || fileName,
    };
}

export async function deleteBibliotecaFile(storagePath) {
    if (!storagePath) return;
    const user = getCurrentUser();
    if (!user) return;
    const app = getStorageApp();
    const storage = getStorage(app);
    await deleteObject(ref(storage, storagePath));
}
