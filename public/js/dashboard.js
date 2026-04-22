import { modal } from './modal.js';

let frequenciaData = { registros: [] };
const FREQ_KEY = 'pomodash_frequencia';
const frequenciaListeners = new Set();

function emitFrequenciaChange() {
    const snapshot = getFrequenciaData();
    frequenciaListeners.forEach(listener => {
        try {
            listener(snapshot);
        } catch (e) {
            console.warn(e);
        }
    });
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function saveFrequencia() {
    localStorage.setItem(FREQ_KEY, JSON.stringify(frequenciaData));
    emitFrequenciaChange();
}

export function loadFrequencia() {
    try {
        const s = localStorage.getItem(FREQ_KEY);
        if (s) {
            const d = JSON.parse(s);
            if (Array.isArray(d.registros)) frequenciaData = d;
        }
    } catch(e) {}
}

function hasCheckinToday() {
    return frequenciaData.registros.includes(todayStr());
}

function buildHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    const yearEl = document.getElementById('heatmapYear');
    if (!grid) return;
    const today = new Date();
    const year = today.getFullYear();
    if (yearEl) yearEl.textContent = year;
    const jan1 = new Date(year, 0, 1);
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - jan1.getDay());
    const set = new Set(frequenciaData.registros);
    grid.innerHTML = '';
    let cur = new Date(start);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    while (cur <= end) {
        const col = document.createElement('div');
        col.className = 'heatmap-week-col';
        for (let d = 0; d < 7; d++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            const ds = cur.toISOString().slice(0, 10);
            const isFuture = cur > today;
            const isToday = ds === todayStr();
            const hit = set.has(ds);
            cell.setAttribute('data-level', isFuture ? '0' : hit ? '4' : '0');
            if (isToday) cell.style.outline = '2px solid #e10600';
            cell.title = `${cur.toLocaleDateString('pt-BR')}${hit ? ' ✓' : ''}`;
            col.appendChild(cell);
            cur.setDate(cur.getDate() + 1);
        }
        grid.appendChild(col);
    }
}

function buildMonthBars() {
    const wrap = document.getElementById('monthBars');
    const yearEl = document.getElementById('monthBarsYear');
    if (!wrap) return;
    const year = new Date().getFullYear();
    if (yearEl) yearEl.textContent = year;
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const counts = Array(12).fill(0);
    frequenciaData.registros.forEach(r => {
        if (r.startsWith(String(year))) {
            const m = parseInt(r.slice(5, 7), 10) - 1;
            if (m >= 0 && m < 12) counts[m]++;
        }
    });
    const max = Math.max(...counts, 1);
    wrap.innerHTML = '';
    const curMonth = new Date().getMonth();
    counts.forEach((v, i) => {
        const col = document.createElement('div');
        col.className = 'month-bar-col';
        const pct = Math.round((v / max) * 100);
        col.innerHTML = `<div class="month-bar-val">${v > 0 ? v : ''}</div><div class="month-bar" style="height:${Math.max(pct, v > 0 ? 8 : 3)}%;opacity:${i === curMonth ? '1' : '0.55'}"></div><div class="month-bar-label" style="${i === curMonth ? 'color:#e10600;opacity:1' : ''}">${months[i]}</div>`;
        wrap.appendChild(col);
    });
}

function buildStreakDays() {
    const wrap = document.getElementById('streakDays');
    if (!wrap) return;
    const set = new Set(frequenciaData.registros);
    const today = new Date();
    wrap.innerHTML = '';
    for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const hit = set.has(ds);
        const isToday = i === 0;
        const col = document.createElement('div');
        col.className = 'streak-day';
        col.innerHTML = `<div class="streak-day-dot ${hit ? 'hit' : 'miss'}${isToday ? ' today' : ''}">${hit ? '<i class="fas fa-check" style="font-size:0.6rem"></i>' : d.getDate()}</div><div class="streak-day-label">${d.toLocaleDateString('pt-BR',{weekday:'short'}).slice(0,3)}</div>`;
        wrap.appendChild(col);
    }
}

function buildDashStats() {
    const wrap = document.getElementById('dashStats');
    if (!wrap) return;
    const set = new Set(frequenciaData.registros);
    const total = set.size;
    const year = new Date().getFullYear();
    const thisYear = frequenciaData.registros.filter(r => r.startsWith(String(year))).length;
    let streak = 0;
    const d = new Date();
    while (true) {
        const ds = d.toISOString().slice(0, 10);
        if (set.has(ds)) { streak++; d.setDate(d.getDate() - 1); }
        else break;
    }
    let weekSum = 0;
    const now = new Date();
    for (let w = 0; w < 4; w++) {
        for (let day = 0; day < 7; day++) {
            const dd = new Date(now);
            dd.setDate(now.getDate() - w * 7 - day);
            if (set.has(dd.toISOString().slice(0, 10))) weekSum++;
        }
    }
    const weekAvg = (weekSum / 4).toFixed(1);
    wrap.innerHTML = `
        <div class="dash-stat"><div class="dash-stat-label">🔥 Sequência atual</div><div class="dash-stat-value dash-stat-accent">${streak}</div><div class="dash-stat-sub">dia${streak !== 1 ? 's' : ''} consecutivo${streak !== 1 ? 's' : ''}</div></div>
        <div class="dash-stat"><div class="dash-stat-label">📅 Este ano</div><div class="dash-stat-value">${thisYear}</div><div class="dash-stat-sub">presença${thisYear !== 1 ? 's' : ''} registrada${thisYear !== 1 ? 's' : ''}</div></div>
        <div class="dash-stat"><div class="dash-stat-label">📈 Média semanal</div><div class="dash-stat-value">${weekAvg}</div><div class="dash-stat-sub">dias/semana (últimas 4)</div></div>
        <div class="dash-stat"><div class="dash-stat-label">🏆 Total geral</div><div class="dash-stat-value">${total}</div><div class="dash-stat-sub">dia${total !== 1 ? 's' : ''} de estudo no total</div></div>
    `;
}

function buildGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const el = document.getElementById('dashGreeting');
    if (el) el.textContent = `${greet} 👋`;
    const dateEl = document.getElementById('dashDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function renderDashboard() {
    buildGreeting();
    buildDashStats();
    buildHeatmap();
    buildMonthBars();
    buildStreakDays();
    const btn = document.getElementById('checkinBtn');
    if (btn) {
        const done = hasCheckinToday();
        btn.disabled = done;
        btn.className = `checkin-btn${done ? ' done' : ''}`;
        btn.innerHTML = done ? '<i class="fas fa-check-double"></i> Presença registrada!' : '<i class="fas fa-check"></i> Registrar presença hoje';
    }
}

export function initDashboard() {
    loadFrequencia();
    document.getElementById('checkinBtn')?.addEventListener('click', () => {
        if (hasCheckinToday()) return;
        frequenciaData.registros.push(todayStr());
        saveFrequencia();
        renderDashboard();
        modal.confirmDialog({ title: 'Presença registrada! ✅', body: 'Ótimo, mais um dia de estudos registrado. Continue assim!', icon: 'fas fa-calendar-check', confirmLabel: 'Valeu!', iconVariant: 'success' });
    });
    renderDashboard();
}

export function getFrequenciaData() {
    return { registros: [...frequenciaData.registros] };
}

export function applyFrequenciaData(data = {}) {
    frequenciaData = {
        registros: Array.isArray(data.registros) ? [...data.registros] : [],
    };
    localStorage.setItem(FREQ_KEY, JSON.stringify(frequenciaData));
}

export function onFrequenciaChange(listener) {
    frequenciaListeners.add(listener);
    return () => frequenciaListeners.delete(listener);
}
