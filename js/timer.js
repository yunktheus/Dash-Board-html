import { modal } from './modal.js';
import { dayNames } from './utils.js';

export const timersState = {};

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

function syncTimerButton(day) {
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
}

function startTimer(day, seconds) {
    stopTimer(day);
    timersState[day] = { intervalId: null, timeLeft: seconds, isRunning: true };
    timersState[day].intervalId = setInterval(() => {
        const state = timersState[day];
        if (!state || !state.isRunning) return;
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            stopTimer(day);
            delete timersState[day];
            syncTimerButton(day);
            playF1RadioSound();
            modal.confirmDialog({
                title: 'Tempo finalizado! 🏁',
                subtitle: dayNames[day],
                body: 'Ótimo trabalho! Seu timer chegou ao fim.',
                icon: 'fas fa-flag-checkered',
                confirmLabel: 'Fechar',
                iconVariant: 'success'
            });
            return;
        }
        syncTimerButton(day);
    }, 1000);
    syncTimerButton(day);
}

export async function handleTimerClick(day) {
    const state = timersState[day];
    if (!state) {
        const minutes = await modal.timerPicker({ subtitle: dayNames[day] });
        if (minutes !== null) startTimer(day, minutes * 60);
        return;
    }
    if (state.isRunning) {
        stopTimer(day);
        syncTimerButton(day);
    } else {
        state.isRunning = true;
        state.intervalId = setInterval(() => {
            const s = timersState[day];
            if (!s || !s.isRunning) return;
            s.timeLeft--;
            if (s.timeLeft <= 0) {
                stopTimer(day);
                delete timersState[day];
                syncTimerButton(day);
                playF1RadioSound();
                modal.confirmDialog({
                    title: 'Tempo finalizado! 🏁',
                    subtitle: dayNames[day],
                    body: 'Ótimo trabalho! Seu timer chegou ao fim.',
                    icon: 'fas fa-flag-checkered',
                    confirmLabel: 'Fechar',
                    iconVariant: 'success'
                });
                return;
            }
            syncTimerButton(day);
        }, 1000);
        syncTimerButton(day);
    }
}