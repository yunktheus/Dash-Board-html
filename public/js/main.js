import { modal } from './modal.js';
import { tasksData, notes, resourcesData, bibliotecaData, saveAll, loadFromLocal, loadSavedTitle, updatePageTitle } from './storage.js';
import { renderWeek } from './tasks.js';
import { renderResources } from './resources.js';
import { initBiblioteca, renderBiblioteca, updateBibBadge } from './biblioteca.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initNavigation } from './navigation.js';
import { initTimerSystem } from './timer.js';

function exportData() {
    const customTitle = document.getElementById('editableTitle').value;
    const payload = JSON.stringify({ tasksData, notes, resourcesData, bibliotecaData, customTitle }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudos_${customTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const imported = JSON.parse(ev.target.result);
            if (!imported.tasksData || !imported.notes) {
                modal.confirmDialog({ title: 'Arquivo inválido', body: 'A estrutura do arquivo não foi reconhecida.', icon: 'fas fa-triangle-exclamation', confirmLabel: 'Fechar', danger: true, iconVariant: 'warning' });
                return;
            }
            Object.assign(tasksData, imported.tasksData);
            Object.assign(notes, imported.notes);
            if (imported.resourcesData) Object.assign(resourcesData, imported.resourcesData);
            if (imported.bibliotecaData) {
                Object.assign(bibliotecaData, imported.bibliotecaData);
                if (!Array.isArray(bibliotecaData.pastas)) bibliotecaData.pastas = [];
                if (!Array.isArray(bibliotecaData.itens)) bibliotecaData.itens = [];
            }
            if (imported.customTitle) {
                document.getElementById('editableTitle').value = imported.customTitle;
                updatePageTitle(imported.customTitle);
            }
            saveAll();
            renderWeek();
            renderResources();
            renderBiblioteca();
            renderDashboard();
            updateBibBadge();
            modal.confirmDialog({ title: 'Backup restaurado!', body: 'Seus dados foram importados com sucesso.', icon: 'fas fa-circle-check', confirmLabel: 'Fechar', iconVariant: 'success' });
        } catch (e) {
            modal.confirmDialog({ title: 'Erro ao importar', body: 'O arquivo está corrompido ou em formato inválido.', icon: 'fas fa-triangle-exclamation', confirmLabel: 'Fechar', danger: true, iconVariant: 'warning' });
        }
    };
    reader.readAsText(file);
}

function initTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    const isLight = localStorage.getItem('theme') === 'light';
    const applyTheme = light => {
        body.classList.toggle('dark', !light);
        body.classList.toggle('light', light);
        btn.innerHTML = light
            ? '<span class="nav-item-icon"><i class="fas fa-moon"></i></span><span>Modo Escuro</span>'
            : '<span class="nav-item-icon"><i class="fas fa-sun"></i></span><span>Modo Claro</span>';
        localStorage.setItem('theme', light ? 'light' : 'dark');
    };
    applyTheme(isLight);
    btn.addEventListener('click', () => applyTheme(body.classList.contains('dark')));
}

function setupEditableTitle() {
    const input = document.getElementById('editableTitle');
    input.addEventListener('blur', () => {
        const newTitle = input.value.trim() || 'PomoDash';
        input.value = newTitle;
        updatePageTitle(newTitle);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

document.addEventListener('DOMContentLoaded', () => {
    modal.init();
    registerServiceWorker();
    initTheme();
    loadSavedTitle();
    setupEditableTitle();
    loadFromLocal();
    initTimerSystem();
    renderWeek();
    renderResources();
    initBiblioteca();
    initDashboard();
    initNavigation();

    document.getElementById('exportBtn')?.addEventListener('click', exportData);
    document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile')?.addEventListener('change', e => {
        if (e.target.files.length) importData(e.target.files[0]);
        e.target.value = '';
    });
});
