import { escapeHtml, genId, daysOrder, dayNames } from './utils.js';
import { modal } from './modal.js';
import { bibliotecaData, saveAll } from './storage.js';
import { deleteBibliotecaFile, uploadBibliotecaFile } from './file-storage.js';

const TYPE_ICONS = {
    link: { icon: 'fas fa-link', cls: 'bib-item-type-link' },
    pdf: { icon: 'fas fa-file-pdf', cls: 'bib-item-type-pdf' },
    doc: { icon: 'fas fa-file-lines', cls: 'bib-item-type-doc' },
    note: { icon: 'fas fa-sticky-note', cls: 'bib-item-type-note' },
    image: { icon: 'fas fa-image', cls: 'bib-item-type-note' },
    file: { icon: 'fas fa-paperclip', cls: 'bib-item-type-doc' },
};

let bibActiveFilter = 'all';

function getItemMeta(item) {
    return item.originalName || item.cloudNote || item.url || '—';
}

function getItemPreview(item) {
    if (item.tipo !== 'image' || !item.url) return '';
    return `<img class="bib-item-preview" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.titulo)}">`;
}

function createItemCard(item, dayLabel, openTitle) {
    const ti = TYPE_ICONS[item.tipo] || TYPE_ICONS.link;
    const metaText = getItemMeta(item);
    const preview = getItemPreview(item);
    const div = document.createElement('div');
    div.className = 'bib-item';
    div.innerHTML = `
        <div class="bib-item-type-icon ${ti.cls}"><i class="${ti.icon}"></i></div>
        <div class="bib-item-info">
            <div class="bib-item-title">${escapeHtml(item.titulo)}</div>
            <div class="bib-item-meta">${escapeHtml(metaText)} · ${escapeHtml(item.addedAt || '')}</div>
            ${preview}
        </div>
        <span class="bib-item-day-tag">${escapeHtml(dayLabel)}</span>
        <div class="bib-item-actions">
            ${item.url ? `<button class="bib-item-action-btn bib-item-open-btn" title="${openTitle}"><i class="fas fa-arrow-up-right-from-square"></i></button>` : ''}
            <button class="bib-item-action-btn bib-delete-btn" data-id="${escapeHtml(item.id)}" title="Remover"><i class="fas fa-trash"></i></button>
        </div>
    `;

    if (item.url) {
        div.querySelector('.bib-item-open-btn')?.addEventListener('click', () => window.open(item.url, '_blank'));
    }

    div.querySelector('.bib-delete-btn')?.addEventListener('click', async () => {
        const ok = await modal.confirmDialog({
            title: 'Remover material?',
            body: `"${item.titulo}"`,
            confirmLabel: 'Remover',
            danger: true,
        });
        if (ok) {
            if (item.storagePath) {
                try {
                    await deleteBibliotecaFile(item.storagePath);
                } catch (e) {
                    console.warn(e);
                }
            }
            bibliotecaData.itens = bibliotecaData.itens.filter(i => i.id !== item.id);
            saveAll();
            renderBiblioteca();
            updateBibBadge();
        }
    });

    return div;
}

export function updateBibBadge() {
    const badge = document.getElementById('badgeBiblioteca');
    if (badge) badge.textContent = bibliotecaData.itens.length;
}

export function renderBiblioteca() {
    const content = document.getElementById('bibContent');
    if (!content) return;
    content.innerHTML = '';

    const itensVisiveis = bibActiveFilter === 'all'
        ? bibliotecaData.itens
        : bibliotecaData.itens.filter(i => i.day === bibActiveFilter);

    if (bibliotecaData.pastas.length === 0) {
        content.innerHTML = `<div class="bib-empty-cat" style="max-width:480px;margin:0 auto"><i class="fas fa-folder-plus" style="font-size:2rem;display:block;margin-bottom:10px;color:#e10600"></i><p style="font-weight:700;opacity:0.8;margin-bottom:4px">Nenhuma pasta ainda</p><p>Crie sua primeira pasta para organizar seus materiais de estudo.</p><p style="margin-top:10px;font-size:0.78rem;opacity:0.6">Modo teste ativo: uploads autenticados com limite de 20 MB por arquivo.</p></div>`;
        return;
    }

    bibliotecaData.pastas.forEach(pasta => {
        const pastaItens = itensVisiveis.filter(i => i.pastaId === pasta.id);
        const section = document.createElement('div');
        section.className = 'bib-category';
        section.innerHTML = `
            <div class="bib-category-header">
                <div class="bib-category-icon" style="background:${pasta.cor}22;color:${pasta.cor}"><i class="fas fa-folder"></i></div>
                <span class="bib-category-title">${escapeHtml(pasta.nome)}</span>
                <span class="bib-category-count">${pastaItens.length}</span>
                <div class="bib-item-actions" style="opacity:1;margin-left:auto">
                    <button class="bib-item-action-btn bib-pasta-add-btn" data-pasta="${pasta.id}" title="Adicionar à pasta"><i class="fas fa-plus"></i></button>
                    <button class="bib-item-action-btn bib-pasta-rename-btn" data-pasta="${pasta.id}" title="Renomear pasta"><i class="fas fa-pen"></i></button>
                    <button class="bib-item-action-btn" style="color:#ef4444!important" data-pasta-del="${pasta.id}" title="Excluir pasta"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="bib-items-grid" id="bib-grid-${pasta.id}"></div>
        `;
        content.appendChild(section);
        const grid = section.querySelector(`.bib-items-grid`);

        if (pastaItens.length === 0) {
            grid.innerHTML = `<div class="bib-empty-cat" style="padding:14px">Pasta vazia · clique em <i class="fas fa-plus"></i> para adicionar</div>`;
        } else {
            pastaItens.forEach(item => {
                const dayLabel = item.day === 'geral' ? 'Geral' : (dayNames[item.day] || item.day);
                grid.appendChild(createItemCard(item, dayLabel, 'Abrir link'));
            });
        }

        section.querySelector('.bib-pasta-add-btn')?.addEventListener('click', () => openAddBibModal('geral', pasta.id));
        section.querySelector('.bib-pasta-rename-btn')?.addEventListener('click', async () => {
            const newName = await modal.prompt({ title: 'Renomear pasta', value: pasta.nome, icon: 'fas fa-folder', confirmLabel: 'Renomear' });
            if (newName) {
                pasta.nome = newName;
                saveAll();
                renderBiblioteca();
            }
        });
        section.querySelector('[data-pasta-del]')?.addEventListener('click', async () => {
            const count = bibliotecaData.itens.filter(i => i.pastaId === pasta.id).length;
            const ok = await modal.confirmDialog({
                title: 'Excluir pasta?',
                body: count > 0 ? `A pasta "${pasta.nome}" tem ${count} item(s). Todos serão removidos.` : `A pasta "${pasta.nome}" será excluída.`,
                confirmLabel: 'Excluir',
                danger: true,
            });
            if (ok) {
                bibliotecaData.itens = bibliotecaData.itens.filter(i => i.pastaId !== pasta.id);
                bibliotecaData.pastas = bibliotecaData.pastas.filter(p => p.id !== pasta.id);
                saveAll();
                renderBiblioteca();
                updateBibBadge();
            }
        });
    });

    const semPasta = itensVisiveis.filter(i => !bibliotecaData.pastas.find(p => p.id === i.pastaId));
    if (semPasta.length > 0) {
        const section = document.createElement('div');
        section.className = 'bib-category';
        section.innerHTML = `<div class="bib-category-header"><div class="bib-category-icon" style="background:rgba(148,163,184,0.15);color:#94a3b8"><i class="fas fa-folder-open"></i></div><span class="bib-category-title">Sem pasta</span><span class="bib-category-count">${semPasta.length}</span></div><div class="bib-items-grid" id="bib-grid-nopasta"></div>`;
        content.appendChild(section);
        const grid = section.querySelector('#bib-grid-nopasta');
        semPasta.forEach(item => {
            const dayLabel = item.day === 'geral' ? 'Geral' : (dayNames[item.day] || item.day);
            grid.appendChild(createItemCard(item, dayLabel, 'Abrir'));
        });
    }
}

async function openNewPastaModal() {
    const nome = await modal.prompt({ title: 'Nova pasta', subtitle: 'Escolha um nome para organizar seus materiais', placeholder: 'Ex: JavaScript, Copywriting, Referências...', icon: 'fas fa-folder-plus', confirmLabel: 'Criar' });
    if (!nome) return;
    const cor = await modal.colorPicker(nome);
    if (!cor) return;
    const pasta = { id: genId(), nome, cor };
    bibliotecaData.pastas.push(pasta);
    saveAll();
    renderBiblioteca();
}

async function openAddBibModal(defaultDay = 'geral', defaultPastaId = null) {
    const pastaOptions = bibliotecaData.pastas.length > 0
        ? [`<option value="">— Sem pasta —</option>`, ...bibliotecaData.pastas.map(p => `<option value="${p.id}"${p.id === defaultPastaId ? ' selected' : ''}>${escapeHtml(p.nome)}</option>`)].join('')
        : '<option value="">Nenhuma pasta criada ainda</option>';
    const dayOptions = [`<option value="geral">Geral</option>`, ...daysOrder.map(d => `<option value="${d}"${d === defaultDay ? ' selected' : ''}>${dayNames[d]}</option>`)].join('');
    const tipoOptions = [
        '<option value="link">🔗 Link / Site</option>',
        '<option value="pdf">📄 PDF</option>',
        '<option value="doc">📝 Documento</option>',
        '<option value="note">🗒️ Anotação</option>',
        '<option value="image">🖼️ Imagem</option>',
        '<option value="file">📎 Arquivo</option>',
    ].join('');

    const newItem = await new Promise(resolve => {
        modal.resolve = resolve;
        document.getElementById('modalTitle').textContent = 'Adicionar material';
        document.getElementById('modalSubtitle').textContent = defaultDay === 'geral' ? '' : (dayNames[defaultDay] || '');
        const iconEl = document.getElementById('modalIcon');
        iconEl.innerHTML = '<i class="fas fa-folder-plus"></i>';
        iconEl.className = 'modal-icon info';
        modal.confirmBtn.textContent = 'Salvar';
        modal.confirmBtn.className = 'modal-btn modal-btn-confirm';
        modal.bodyText.style.display = 'none';
        modal.inputWrap.style.display = '';
        modal.inputWrap.innerHTML = `
            <div class="bib-modal-fields">
                <div><div class="bib-field-label">Título *</div><input type="text" class="modal-input" id="_bibTitulo" maxlength="100" placeholder="Ex: Curso de JavaScript" autocomplete="off"></div>
                <div><div class="bib-field-label">URL / Link (opcional)</div><input type="url" class="modal-input" id="_bibUrl" placeholder="https://..." autocomplete="off"></div>
                <div><div class="bib-field-label">Arquivo (modo teste, até 20 MB)</div><input type="file" class="modal-input" id="_bibFile" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt,image/*,application/pdf,.doc,.docx,.txt"></div>
                <div><div class="bib-field-label">Origem em nuvem (opcional)</div><input type="text" class="modal-input" id="_bibCloudNote" maxlength="120" placeholder="Ex: Drive, link público, pasta compartilhada"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><div class="bib-field-label">Tipo</div><select class="bib-select" id="_bibTipo">${tipoOptions}</select></div><div><div class="bib-field-label">Pasta</div><select class="bib-select" id="_bibPasta">${pastaOptions}</select></div></div>
                <div><div class="bib-field-label">Dia de referência</div><select class="bib-select" id="_bibDay">${dayOptions}</select></div>
            </div>
        `;
        modal.bibMode = true;
        modal.open();
        setTimeout(() => document.getElementById('_bibTitulo')?.focus(), 60);
    });

    if (newItem) {
        if (newItem.localFile) {
            try {
                const upload = await uploadBibliotecaFile(newItem.localFile);
                Object.assign(newItem, upload);
            } catch (error) {
                await modal.confirmDialog({
                    title: 'Upload não concluído',
                    body: error.message || 'Não foi possível enviar o arquivo.',
                    icon: 'fas fa-triangle-exclamation',
                    confirmLabel: 'Fechar',
                    danger: true,
                    iconVariant: 'warning',
                });
                return;
            }
            delete newItem.localFile;
        }
        bibliotecaData.itens.push(newItem);
        saveAll();
        renderBiblioteca();
        updateBibBadge();
    }
}

export function setBibFilterAndAdd(day) {
    bibActiveFilter = day;
    renderBiblioteca();
    openAddBibModal(day);
}

export function initBiblioteca() {
    window.setBibFilterAndAdd = setBibFilterAndAdd;
    document.getElementById('bibAddBtn')?.addEventListener('click', () => openAddBibModal('geral'));
    document.getElementById('bibNewPastaBtn')?.addEventListener('click', openNewPastaModal);
    document.getElementById('bibFilters')?.addEventListener('click', e => {
        const btn = e.target.closest('.bib-filter-btn');
        if (!btn) return;
        bibActiveFilter = btn.dataset.filter;
        document.querySelectorAll('.bib-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderBiblioteca();
    });
    renderBiblioteca();
    updateBibBadge();
}
