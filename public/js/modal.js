import { genId } from './utils.js';

class ModalEngine {
    constructor() {
        this.overlay = null;
        this.input = null;
        this.confirmBtn = null;
        this.cancelBtn = null;
        this.charCount = null;
        this.bodyText = null;
        this.inputWrap = null;
        this.resolve = null;
        this.colorPickerMode = false;
        this.bibMode = false;
        this.timerMode = false;
        this.noteMode = false;
        this.colorGetVal = null;
        this.timerGetVal = null;
    }

    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.input = document.getElementById('modalInput');
        this.confirmBtn = document.getElementById('modalConfirm');
        this.cancelBtn = document.getElementById('modalCancel');
        this.charCount = document.getElementById('modalCharCount');
        this.bodyText = document.getElementById('modalBodyText');
        this.inputWrap = document.getElementById('modalInputWrap');

        this.confirmBtn.addEventListener('click', () => this.submit());
        this.cancelBtn.addEventListener('click', () => this.close(null));
        this.overlay.addEventListener('click', e => { if (e.target === this.overlay) this.close(null); });
        document.addEventListener('keydown', e => {
            if (!this.overlay.classList.contains('open')) return;
            if (e.key === 'Escape') this.close(null);
            if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.submit();
            }
        });
        if (this.input) {
            this.input.addEventListener('input', () => {
                const len = this.input.value.length;
                const max = parseInt(this.input.getAttribute('maxlength'), 10);
                if (this.charCount) this.charCount.textContent = `${len} / ${max}`;
            });
        }
    }

    prompt({ title, subtitle = '', placeholder = 'Digite aqui…', value = '', icon = 'fas fa-pen', confirmLabel = 'Salvar', maxLength = 120 } = {}) {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.setupInputMode({ title, subtitle, icon, confirmLabel, placeholder, value, maxLength });
            this.open();
        });
    }

    confirmDialog({ title, subtitle = '', body = '', icon = 'fas fa-trash', confirmLabel = 'Confirmar', danger = false, iconVariant = '' } = {}) {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.setupConfirmMode({ title, subtitle, icon, confirmLabel, body, danger, iconVariant });
            this.open();
        });
    }

    timerPicker({ subtitle = '' } = {}) {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.setupTimerMode(subtitle);
            this.open();
        });
    }

    noteModal({ title = 'Nova anotação', subtitle = '' } = {}) {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.setupNoteMode(title, subtitle);
            this.open();
        });
    }

    setupInputMode({ title, subtitle, icon, confirmLabel, placeholder, value, maxLength }) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalSubtitle').textContent = subtitle;
        const iconEl = document.getElementById('modalIcon');
        iconEl.innerHTML = `<i class="${icon}" aria-hidden="true"></i>`;
        iconEl.className = 'modal-icon';
        this.confirmBtn.textContent = confirmLabel;
        this.confirmBtn.className = 'modal-btn modal-btn-confirm';
        this.inputWrap.style.display = '';
        this.bodyText.style.display = 'none';
        this.input.setAttribute('maxlength', maxLength);
        this.input.setAttribute('placeholder', placeholder);
        this.input.value = value || '';
        if (this.charCount) this.charCount.textContent = `${(value || '').length} / ${maxLength}`;
        this.colorPickerMode = false;
        this.bibMode = false;
        this.timerMode = false;
        this.noteMode = false;
    }

    setupConfirmMode({ title, subtitle, icon, confirmLabel, body, danger, iconVariant }) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalSubtitle').textContent = subtitle;
        const iconEl = document.getElementById('modalIcon');
        iconEl.innerHTML = `<i class="${icon}" aria-hidden="true"></i>`;
        iconEl.className = `modal-icon ${iconVariant ? iconVariant : ''}`;
        this.confirmBtn.textContent = confirmLabel;
        this.confirmBtn.className = `modal-btn ${danger ? 'modal-btn-danger' : 'modal-btn-confirm'}`;
        this.inputWrap.style.display = 'none';
        this.bodyText.style.display = '';
        this.bodyText.textContent = body;
        this.colorPickerMode = false;
        this.bibMode = false;
        this.timerMode = false;
        this.noteMode = false;
    }

    setupTimerMode(subtitle) {
        document.getElementById('modalTitle').textContent = 'Configurar timer';
        document.getElementById('modalSubtitle').textContent = subtitle;
        const iconEl = document.getElementById('modalIcon');
        iconEl.innerHTML = '<i class="fas fa-hourglass-start" aria-hidden="true"></i>';
        iconEl.className = 'modal-icon';
        this.confirmBtn.textContent = 'Iniciar';
        this.confirmBtn.className = 'modal-btn modal-btn-confirm';
        this.inputWrap.style.display = '';
        this.bodyText.style.display = 'none';

        const presets = [
            { label: '5 min',  sub: 'Aquecimento', val: 5 },
            { label: '10 min', sub: 'Rápido',      val: 10 },
            { label: '15 min', sub: 'Foco',        val: 15 },
            { label: '25 min', sub: 'Pomodoro',    val: 25 },
            { label: '45 min', sub: 'Profundo',    val: 45 },
            { label: '60 min', sub: '1 hora',      val: 60 },
        ];
        let selected = 25;

        this.inputWrap.innerHTML = `
            <div class="timer-presets" id="_timerPresets"></div>
            <div class="timer-custom-wrap">
                <span class="timer-custom-label">Outro:</span>
                <input type="number" class="timer-custom-input" id="_timerCustom" min="1" max="180" value="${selected}" aria-label="Minutos personalizado">
                <span class="timer-custom-label">min</span>
            </div>
            <div class="timer-display" id="_timerDisplay">Timer de <strong>${selected} minutos</strong></div>
        `;
        const presetsEl = document.getElementById('_timerPresets');
        const customEl = document.getElementById('_timerCustom');
        const displayEl = document.getElementById('_timerDisplay');

        const setSelected = (val, fromCustom = false) => {
            selected = val;
            displayEl.innerHTML = `Timer de <strong>${val} minuto${val !== 1 ? 's' : ''}</strong>`;
            if (!fromCustom) customEl.value = val;
            presetsEl.querySelectorAll('.timer-preset-btn').forEach(b => {
                b.classList.toggle('selected', parseInt(b.dataset.val, 10) === val);
            });
        };

        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.className = `timer-preset-btn${p.val === selected ? ' selected' : ''}`;
            btn.dataset.val = p.val;
            btn.innerHTML = `${p.label}<span class="timer-preset-label">${p.sub}</span>`;
            btn.addEventListener('click', () => setSelected(p.val));
            presetsEl.appendChild(btn);
        });

        customEl.addEventListener('input', () => {
            const v = parseInt(customEl.value, 10);
            if (Number.isFinite(v) && v >= 1) setSelected(v, true);
        });

        this.timerMode = true;
        this.timerGetVal = () => {
            const v = parseInt(customEl.value, 10);
            return (Number.isFinite(v) && v >= 1) ? v : selected;
        };
    }

    setupNoteMode(title, subtitle) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalSubtitle').textContent = subtitle;
        const iconEl = document.getElementById('modalIcon');
        iconEl.innerHTML = '<i class="fas fa-sticky-note" aria-hidden="true"></i>';
        iconEl.className = 'modal-icon';
        this.confirmBtn.textContent = 'Salvar';
        this.confirmBtn.className = 'modal-btn modal-btn-confirm';
        this.inputWrap.style.display = '';
        this.bodyText.style.display = 'none';
        this.inputWrap.innerHTML = `<textarea class="modal-textarea" id="_noteTextarea" rows="4" maxlength="400" placeholder="Escreva sua anotação aqui…" aria-label="Texto da anotação"></textarea>`;
        this.noteMode = true;
    }

    open() {
        this.overlay.classList.add('open');
        if (this.inputWrap.style.display !== 'none') {
            setTimeout(() => {
                const firstField = this.inputWrap.querySelector('input, textarea, select, button');
                (firstField || this.input || this.confirmBtn)?.focus();
            }, 60);
        } else {
            setTimeout(() => this.confirmBtn.focus(), 60);
        }
    }

    submit() {
        if (this.colorPickerMode) {
            this.colorPickerMode = false;
            const val = this.colorGetVal ? this.colorGetVal() : '#e10600';
            this.colorGetVal = null;
            this.resetInputWrap();
            this.close(val);
            return;
        }
        if (this.bibMode) {
            this.bibMode = false;
            const titulo = document.getElementById('_bibTitulo')?.value.trim() || '';
            const url = document.getElementById('_bibUrl')?.value.trim() || '';
            const tipo = document.getElementById('_bibTipo')?.value || 'link';
            const pastaId = document.getElementById('_bibPasta')?.value || '';
            const day = document.getElementById('_bibDay')?.value || 'geral';
            this.resetInputWrap();
            if (!titulo) { this.close(null); return; }
            const newItem = {
                id: genId(),
                titulo, url, tipo, pastaId, day,
                addedAt: new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }),
            };
            this.close(newItem);
            return;
        }
        if (this.timerMode) {
            this.timerMode = false;
            const val = this.timerGetVal ? this.timerGetVal() : 25;
            this.timerGetVal = null;
            this.resetInputWrap();
            this.close(val);
            return;
        }
        if (this.noteMode) {
            this.noteMode = false;
            const ta = document.getElementById('_noteTextarea');
            const val = ta ? ta.value.trim() : null;
            this.resetInputWrap();
            this.close(val === '' ? null : val);
            return;
        }
        if (this.inputWrap.style.display !== 'none') {
            const val = this.input.value.trim();
            this.close(val === '' ? null : val);
        } else {
            this.close(true);
        }
    }

    close(result) {
        this.overlay.classList.remove('open');
        if (result === null) {
            if (this.colorPickerMode) {
                this.colorPickerMode = false;
                this.colorGetVal = null;
                this.resetInputWrap();
            }
            if (this.bibMode) {
                this.bibMode = false;
                this.resetInputWrap();
            }
            if (this.timerMode) {
                this.timerMode = false;
                this.timerGetVal = null;
                this.resetInputWrap();
            }
            if (this.noteMode) {
                this.noteMode = false;
                this.resetInputWrap();
            }
        }
        if (this.resolve) {
            this.resolve(result);
            this.resolve = null;
        }
    }

    resetInputWrap() {
        this.inputWrap.innerHTML = `
            <input type="text" class="modal-input" id="modalInput"
                   maxlength="120" autocomplete="off" spellcheck="true"
                   placeholder="Digite aqui…" aria-label="Campo de texto">
            <div class="modal-char-count" id="modalCharCount">0 / 120</div>
        `;
        this.input = document.getElementById('modalInput');
        this.charCount = document.getElementById('modalCharCount');
        if (this.input) {
            this.input.addEventListener('input', () => {
                const len = this.input.value.length;
                const max = parseInt(this.input.getAttribute('maxlength'), 10);
                if (this.charCount) this.charCount.textContent = `${len} / ${max}`;
            });
        }
    }

    async colorPicker(pastaNome) {
        const PASTA_CORES = ['#e10600','#6366f1','#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#84cc16','#94a3b8'];
        return new Promise(resolve => {
            this.resolve = resolve;
            document.getElementById('modalTitle').textContent = 'Cor da pasta';
            document.getElementById('modalSubtitle').textContent = pastaNome;
            const iconEl = document.getElementById('modalIcon');
            iconEl.innerHTML = '<i class="fas fa-palette"></i>';
            iconEl.className = 'modal-icon info';
            this.confirmBtn.textContent = 'Confirmar';
            this.confirmBtn.className = 'modal-btn modal-btn-confirm';
            this.bodyText.style.display = 'none';
            this.inputWrap.style.display = '';
            let chosenCor = PASTA_CORES[0];
            this.inputWrap.innerHTML = `
                <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:4px 0">
                    ${PASTA_CORES.map(cor => `
                        <button data-cor="${cor}" style="width:36px;height:36px;border-radius:50%;background:${cor};border:3px solid transparent;cursor:pointer;transition:transform 0.12s,border-color 0.12s;flex-shrink:0 ${cor === chosenCor ? ';border-color:white;transform:scale(1.15)' : ''}" title="${cor}"></button>
                    `).join('')}
                </div>
            `;
            this.colorPickerMode = true;
            this.colorGetVal = () => chosenCor;
            this.inputWrap.querySelectorAll('[data-cor]').forEach(btn => {
                if (btn.dataset.cor === chosenCor) { btn.style.borderColor = 'white'; btn.style.transform = 'scale(1.15)'; }
                btn.addEventListener('click', () => {
                    chosenCor = btn.dataset.cor;
                    this.inputWrap.querySelectorAll('[data-cor]').forEach(b => {
                        b.style.borderColor = b.dataset.cor === chosenCor ? 'white' : 'transparent';
                        b.style.transform = b.dataset.cor === chosenCor ? 'scale(1.15)' : 'scale(1)';
                    });
                });
            });
            this.open();
        });
    }
}

export const modal = new ModalEngine();
