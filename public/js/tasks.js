import { daysOrder, dayNames, escapeHtml } from './utils.js';
import { modal } from './modal.js';
import { tasksData, notes, saveAll } from './storage.js';
import { handleTimerClick, setActiveTimerDay, syncTimerButton } from './timer.js';

export function renderWeek() {
    const grid = document.getElementById('weekGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const day of daysOrder) {
        const tasks = tasksData[day] || [];
        const doneCount = tasks.filter(t => t.done).length;
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <div class="day-title"><span>${escapeHtml(dayNames[day])}</span><small><i class="fas fa-tasks"></i> ${doneCount}/${tasks.length}</small></div>
            <div class="task-list" id="task-list-${day}"></div>
            <button class="add-task-btn" data-day="${day}"><i class="fas fa-plus"></i> Nova tarefa</button>
            <div class="timer-area"><button class="timer-btn" data-day="${day}"><i class="fas fa-hourglass-start"></i> Iniciar timer</button></div>
            <div class="note-area">
                <div class="notes-header"><span class="notes-label"><i class="fas fa-sticky-note"></i> Anotações</span><button class="notes-add-btn" data-day="${day}"><i class="fas fa-plus"></i> Adicionar</button></div>
                <div class="notes-list" id="notes-list-${day}"></div>
            </div>
            <button class="card-biblioteca-btn" data-day="${day}"><i class="fas fa-folder-open"></i> Biblioteca do dia</button>
        `;
        grid.appendChild(card);

        // Tarefas
        const taskContainer = document.getElementById(`task-list-${day}`);
        tasks.forEach((task, idx) => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <input type="checkbox" class="task-check" data-day="${day}" data-taskidx="${idx}" ${task.done ? 'checked' : ''} aria-label="${escapeHtml(task.text)}">
                <span class="task-text${task.done ? ' done' : ''}">${escapeHtml(task.text)}</span>
                <div class="task-edit-buttons"><button class="edit-task" data-day="${day}" data-taskidx="${idx}" title="Editar"><i class="fas fa-pen"></i></button><button class="delete-task" data-day="${day}" data-taskidx="${idx}" title="Excluir"><i class="fas fa-trash"></i></button></div>
            `;
            taskContainer.appendChild(div);
        });

        // Eventos das tarefas
        taskContainer.querySelectorAll('.task-check').forEach(cb => {
            cb.addEventListener('change', () => {
                const d = cb.dataset.day;
                const idx = parseInt(cb.dataset.taskidx, 10);
                if (tasksData[d]?.[idx]) {
                    tasksData[d][idx].done = cb.checked;
                    const span = cb.nextElementSibling;
                    span.classList.toggle('done', cb.checked);
                    const doneNow = tasksData[d].filter(t => t.done).length;
                    card.querySelector('small').innerHTML = `<i class="fas fa-tasks"></i> ${doneNow}/${tasksData[d].length}`;
                    saveAll();
                    updateProgress();
                }
            });
        });

        taskContainer.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', async () => {
                const d = btn.dataset.day;
                const idx = parseInt(btn.dataset.taskidx, 10);
                const newText = await modal.prompt({ title: 'Editar tarefa', subtitle: dayNames[d], value: tasksData[d][idx].text });
                if (newText !== null) {
                    tasksData[d][idx].text = newText;
                    saveAll();
                    renderWeek();
                }
            });
        });

        taskContainer.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', async () => {
                const d = btn.dataset.day;
                const idx = parseInt(btn.dataset.taskidx, 10);
                const ok = await modal.confirmDialog({ title: 'Remover tarefa?', subtitle: dayNames[d], body: `"${tasksData[d][idx].text}"`, confirmLabel: 'Remover', danger: true });
                if (ok) {
                    tasksData[d].splice(idx, 1);
                    saveAll();
                    renderWeek();
                }
            });
        });

        // Nova tarefa
        card.querySelector('.add-task-btn').addEventListener('click', async (e) => {
            const d = e.currentTarget.dataset.day;
            const newText = await modal.prompt({ title: 'Nova tarefa', subtitle: dayNames[d], placeholder: 'Ex: 📚 Estudar capítulo 3 (30min)' });
            if (newText !== null) {
                tasksData[d].push({ text: newText, done: false });
                saveAll();
                renderWeek();
            }
        });

        // Timer
        syncTimerButton(day);
        card.querySelector('.timer-btn').addEventListener('click', () => handleTimerClick(day));
        card.querySelector('.timer-btn').addEventListener('focus', () => setActiveTimerDay(day));

        // Notas
        renderNotesList(day);
        card.querySelector('.notes-add-btn').addEventListener('click', () => openNoteModal(day));

        // Biblioteca do dia
        card.querySelector('.card-biblioteca-btn').addEventListener('click', () => {
            window.navigateTo && window.navigateTo('biblioteca');
            if (window.setBibFilterAndAdd) window.setBibFilterAndAdd(day);
        });
    }
    updateProgress();
}

export function renderNotesList(day) {
    const container = document.getElementById(`notes-list-${day}`);
    if (!container) return;
    const dayNotes = notes[day] || [];
    container.innerHTML = '';
    if (dayNotes.length === 0) {
        container.innerHTML = '<div class="notes-empty">Nenhuma anotação ainda</div>';
        return;
    }
    dayNotes.forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `
            <div class="note-bullet"></div>
            <span class="note-text">${escapeHtml(note.text)}</span>
            <span class="note-meta">${escapeHtml(note.time || '')}</span>
            <button class="note-delete-btn" data-day="${day}" data-idx="${idx}" title="Remover"><i class="fas fa-times"></i></button>
        `;
        div.querySelector('.note-delete-btn').addEventListener('click', async () => {
            const ok = await modal.confirmDialog({ title: 'Remover anotação?', subtitle: dayNames[day], body: `"${note.text}"`, confirmLabel: 'Remover', danger: true });
            if (ok) {
                notes[day].splice(idx, 1);
                saveAll();
                renderNotesList(day);
            }
        });
        container.appendChild(div);
    });
}

async function openNoteModal(day) {
    const text = await modal.noteModal({ title: 'Nova anotação', subtitle: dayNames[day] });
    if (text !== null) {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (!Array.isArray(notes[day])) notes[day] = [];
        notes[day].push({ text, time });
        saveAll();
        renderNotesList(day);
    }
}

export function updateProgress() {
    let total = 0, done = 0;
    for (const day of daysOrder) {
        const tasks = tasksData[day] || [];
        total += tasks.length;
        done += tasks.filter(t => t.done).length;
    }
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const fill = document.getElementById('progressFill');
    if (fill) {
        fill.style.width = `${percent}%`;
        fill.textContent = `${percent}%`;
        fill.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', percent);
    }
}
