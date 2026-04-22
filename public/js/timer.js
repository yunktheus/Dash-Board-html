import { modal } from './modal.js';
import { dayNames } from './utils.js';

export const timersState = {};

const TIMER_STORAGE_KEY = 'pomodash_timer_state';
let activeTimerDay = null;

function shouldIgnoreShortcuts(event) {
    const target = event.target;
    return Boolean(
        target &&
        (target.closest('input, textarea, select, [contenteditable="true"]') ||
            document.getElementById('modalOverlay')?.classList.contains('open'))
    );
}

function getTimerSnapshot() {
    return Object.fromEntries(
        Object.entries(timersState).map(([day, state]) => [
            day,
            {
                timeLeft: state.timeLeft,
                isRunning: state.isRunning,
                endAt: state.endAt ?? null,
            },
        ]),
    );
}

function persistTimers() {
    const snapshot = getTimerSnapshot();
    if (Object.keys(snapshot).length === 0) {
        localStorage.removeItem(TIMER_STORAGE_KEY);
        return;
    }

    localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({
            activeTimerDay,
            timers: snapshot,
        }),
    );
}

async function ensureNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        return Notification.permission;
    }

    try {
        return await Notification.requestPermission();
    } catch (e) {
        return 'default';
    }
}

async function notifyTimerDone(day) {
    const title = 'Tempo finalizado!';
    const body = `${dayNames[day]} concluído. Bora registrar o progresso.`;
    const icon = 'icons/icon.svg';

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body,
                icon,
                badge: icon,
                tag: `timer-${day}`,
            });
            return;
        } catch (e) {}
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, { body, icon });
        } catch (e) {}
    }
}

function playF1RadioSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.connect(ctx.destination);
        [[880, 0, 0.12, 'sine'], [1046.5, 0.14, 0.26, 'triangle']].forEach(([freq, start, stop, type]) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + stop);
        });
    } catch (e) {}
}

export function syncTimerButton(day) {
    const btn = document.querySelector(`.timer-btn[data-day="${day}"]`);
    if (!btn) return;

    const state = timersState[day];
    if (!state) {
        btn.innerHTML = '<i class="fas fa-hourglass-start" aria-hidden="true"></i> Iniciar timer';
        btn.className = 'timer-btn';
        return;
    }

    const mins = String(Math.floor(state.timeLeft / 60)).padStart(2, '0');
    const secs = String(state.timeLeft % 60).padStart(2, '0');

    if (state.isRunning) {
        btn.innerHTML = `<i class="fas fa-pause" aria-hidden="true"></i> Pausar ${mins}:${secs}`;
        btn.className = 'timer-btn pause-btn';
    } else {
        btn.innerHTML = `<i class="fas fa-play" aria-hidden="true"></i> Retomar ${mins}:${secs}`;
        btn.className = 'timer-btn resume-btn';
    }
}

function stopTimer(day) {
    const state = timersState[day];
    if (!state) return;

    if (state.intervalId) clearInterval(state.intervalId);
    state.isRunning = false;
    state.intervalId = null;
    state.endAt = null;
    persistTimers();
}

function clearTimer(day) {
    stopTimer(day);
    delete timersState[day];
    if (activeTimerDay === day) activeTimerDay = null;
    persistTimers();
}

function finishTimer(day) {
    clearTimer(day);
    syncTimerButton(day);
    playF1RadioSound();
    notifyTimerDone(day);
    modal.confirmDialog({
        title: 'Tempo finalizado! 🏁',
        subtitle: dayNames[day],
        body: 'Ótimo trabalho! Seu timer chegou ao fim.',
        icon: 'fas fa-flag-checkered',
        confirmLabel: 'Fechar',
        iconVariant: 'success',
    });
}

function tickTimer(day) {
    const state = timersState[day];
    if (!state || !state.isRunning) return;

    if (state.endAt) {
        state.timeLeft = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    } else {
        state.timeLeft = Math.max(0, state.timeLeft - 1);
    }

    if (state.timeLeft <= 0) {
        finishTimer(day);
        return;
    }

    syncTimerButton(day);
    persistTimers();
}

function runTimer(day) {
    const state = timersState[day];
    if (!state) return;

    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = setInterval(() => tickTimer(day), 1000);
    tickTimer(day);
}

function resumeTimer(day) {
    const state = timersState[day];
    if (!state) return;

    state.isRunning = true;
    state.endAt = Date.now() + state.timeLeft * 1000;
    activeTimerDay = day;
    persistTimers();
    runTimer(day);
}

function startTimer(day, seconds) {
    stopTimer(day);
    timersState[day] = {
        intervalId: null,
        timeLeft: seconds,
        isRunning: true,
        endAt: Date.now() + seconds * 1000,
    };
    activeTimerDay = day;
    persistTimers();
    runTimer(day);
}

function pauseTimer(day) {
    stopTimer(day);
    syncTimerButton(day);
}

function getShortcutTimerDay() {
    if (activeTimerDay && timersState[activeTimerDay]) return activeTimerDay;

    const running = Object.keys(timersState).find(day => timersState[day]?.isRunning);
    if (running) return running;

    return Object.keys(timersState)[0] || null;
}

function registerTimerShortcuts() {
    document.addEventListener('keydown', async event => {
        if (shouldIgnoreShortcuts(event)) return;

        const day = getShortcutTimerDay();
        if (!day) return;

        if (event.code === 'Space') {
            event.preventDefault();
            const state = timersState[day];
            if (!state) return;
            if (state.isRunning) pauseTimer(day);
            else resumeTimer(day);
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            const state = timersState[day];
            if (!state) return;

            const ok = await modal.confirmDialog({
                title: 'Parar timer?',
                subtitle: dayNames[day],
                body: 'O tempo atual será descartado.',
                icon: 'fas fa-stop',
                confirmLabel: 'Parar',
                danger: true,
            });

            if (ok) clearTimer(day);
            syncTimerButton(day);
        }
    });
}

function restoreTimers() {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);
        activeTimerDay = parsed.activeTimerDay || null;
        const savedTimers = parsed.timers || {};

        for (const [day, state] of Object.entries(savedTimers)) {
            if (!state || typeof state.timeLeft !== 'number') continue;

            const restored = {
                intervalId: null,
                timeLeft: Math.max(0, Math.round(state.timeLeft)),
                isRunning: Boolean(state.isRunning),
                endAt: state.endAt ?? null,
            };

            if (restored.isRunning && restored.endAt) {
                restored.timeLeft = Math.max(0, Math.ceil((restored.endAt - Date.now()) / 1000));
            }

            if (restored.timeLeft <= 0) continue;
            timersState[day] = restored;
        }
    } catch (e) {
        localStorage.removeItem(TIMER_STORAGE_KEY);
    }

    for (const [day, state] of Object.entries(timersState)) {
        if (state.isRunning) runTimer(day);
        else syncTimerButton(day);
    }

    persistTimers();
}

export function setActiveTimerDay(day) {
    activeTimerDay = day;
    persistTimers();
}

export function initTimerSystem() {
    restoreTimers();
    registerTimerShortcuts();
}

export async function handleTimerClick(day) {
    setActiveTimerDay(day);

    const state = timersState[day];
    if (!state) {
        const minutes = await modal.timerPicker({ subtitle: dayNames[day] });
        if (minutes !== null) {
            await ensureNotificationPermission();
            startTimer(day, minutes * 60);
        }
        return;
    }

    if (state.isRunning) {
        pauseTimer(day);
    } else {
        await ensureNotificationPermission();
        resumeTimer(day);
    }
}
