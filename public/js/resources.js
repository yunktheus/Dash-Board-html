import { escapeHtml } from './utils.js';
import { modal } from './modal.js';
import { resourcesData, saveAll } from './storage.js';

export function renderResources() {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;
    container.innerHTML = '';

    for (const [key, resource] of Object.entries(resourcesData)) {
        const card = document.createElement('div');
        card.className = 'card-idea';
        card.innerHTML = `
            <div class="card-header">
                <input type="text" class="editable-section-title" data-resource-key="${escapeHtml(key)}" value="${escapeHtml(resource.title)}" aria-label="Título da seção">
                <button class="add-idea-btn" data-resource-key="${escapeHtml(key)}" style="width:auto;padding:4px 12px"><i class="fas fa-plus"></i> Item</button>
            </div>
            <ul class="idea-list" id="idea-list-${escapeHtml(key)}"></ul>
        `;
        container.appendChild(card);

        const listEl = document.getElementById(`idea-list-${key}`);
        resource.items.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'idea-item';
            li.innerHTML = `
                <span class="idea-text">${escapeHtml(item)}</span>
                <div class="task-edit-buttons">
                    <button class="edit-idea" data-resource="${escapeHtml(key)}" data-idx="${idx}" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="delete-idea" data-resource="${escapeHtml(key)}" data-idx="${idx}" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            `;
            listEl.appendChild(li);
        });

        // Editar título
        const titleInput = card.querySelector('.editable-section-title');
        titleInput.addEventListener('blur', () => {
            const newTitle = titleInput.value.trim();
            if (newTitle) { resourcesData[key].title = newTitle; saveAll(); }
            else titleInput.value = resourcesData[key].title;
        });
        titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); titleInput.blur(); } });

        // Adicionar item
        card.querySelector('.add-idea-btn').addEventListener('click', async () => {
            const newItem = await modal.prompt({ title: 'Novo item', subtitle: resourcesData[key].title, placeholder: 'Ex: 🚀 Novo projeto de estudo' });
            if (newItem !== null) {
                resourcesData[key].items.push(newItem);
                saveAll();
                renderResources();
            }
        });

        // Editar item
        listEl.querySelectorAll('.edit-idea').forEach(btn => {
            btn.addEventListener('click', async () => {
                const rKey = btn.dataset.resource;
                const idx = parseInt(btn.dataset.idx, 10);
                const newText = await modal.prompt({ title: 'Editar item', subtitle: resourcesData[rKey].title, value: resourcesData[rKey].items[idx] });
                if (newText !== null) {
                    resourcesData[rKey].items[idx] = newText;
                    saveAll();
                    renderResources();
                }
            });
        });

        // Excluir item
        listEl.querySelectorAll('.delete-idea').forEach(btn => {
            btn.addEventListener('click', async () => {
                const rKey = btn.dataset.resource;
                const idx = parseInt(btn.dataset.idx, 10);
                const ok = await modal.confirmDialog({ title: 'Remover item?', subtitle: resourcesData[rKey].title, body: `"${resourcesData[rKey].items[idx]}"`, confirmLabel: 'Remover', danger: true });
                if (ok) {
                    resourcesData[rKey].items.splice(idx, 1);
                    saveAll();
                    renderResources();
                }
            });
        });
    }
}