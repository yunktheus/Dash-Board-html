import { renderBiblioteca, setBibFilterAndAdd } from './biblioteca.js';
import { renderDashboard } from './dashboard.js';

const PAGE_KEY = 'estudosF1_activePage';

export function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
    const page = document.getElementById(`page-${pageId}`);
    if (page) page.classList.add('active');
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    if (pageId === 'biblioteca') renderBiblioteca();
    if (pageId === 'menu') renderDashboard();
    localStorage.setItem(PAGE_KEY, pageId);
}

export function initNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    document.querySelectorAll('.menu-card[data-goto]').forEach(card => {
        card.addEventListener('click', () => navigateTo(card.dataset.goto));
    });
    const saved = localStorage.getItem(PAGE_KEY) || 'menu';
    navigateTo(saved);
}