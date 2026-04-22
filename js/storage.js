import { daysOrder, defaultTasks } from './utils.js';

// Estado global
export let tasksData = JSON.parse(JSON.stringify(defaultTasks));
export let notes = { segunda: [], terca: [], quarta: [], quinta: [], sexta: [] };
export let resourcesData = {
    programacao: {
        title: "Ideias Programação",
        items: [
            "✅ Calculadora interativa",
            "✅ To-do list com localStorage",
            "✅ Gerador de senhas",
            "✅ Jogo da velha",
            "✅ Dashboard de estudos"
        ]
    },
    marketing: {
        title: "Exercícios Marketing",
        items: [
            "📈 Criar funil de vendas",
            "📊 Campanha para Instagram",
            "✍️ Escrever 3 headlines de copy",
            "🔍 Pesquisar palavras-chave SEO",
            "📧 Sequência de e-mail marketing"
        ]
    }
};

export let bibliotecaData = { pastas: [], itens: [] };

const STORAGE_KEY = 'estudosF1_data';
const TITLE_KEY = 'estudosF1_customTitle';

export function saveAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasksData, notes, resourcesData, bibliotecaData }));
}

export function loadFromLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.tasksData) tasksData = data.tasksData;
            if (data.notes) notes = data.notes;
            if (data.resourcesData) resourcesData = data.resourcesData;
            if (data.bibliotecaData) {
                bibliotecaData = data.bibliotecaData;
                if (!Array.isArray(bibliotecaData.pastas)) {
                    bibliotecaData.pastas = Array.isArray(bibliotecaData.categorias)
                        ? bibliotecaData.categorias.map(c => ({ id: c.id, nome: c.nome, cor: c.cor || '#e10600' }))
                        : [];
                }
                if (!Array.isArray(bibliotecaData.itens)) bibliotecaData.itens = [];
                bibliotecaData.itens.forEach(i => { if (!i.pastaId && i.categoriaId) i.pastaId = i.categoriaId; });
                delete bibliotecaData.categorias;
            }
            for (const day of daysOrder) {
                if (!Array.isArray(tasksData[day])) tasksData[day] = [];
                if (typeof notes[day] === 'string') {
                    notes[day] = notes[day].trim() ? [{ text: notes[day].trim(), time: 'Importado' }] : [];
                } else if (!Array.isArray(notes[day])) notes[day] = [];
            }
        } catch (e) { console.warn(e); }
    }
}

export function loadSavedTitle() {
    const saved = localStorage.getItem(TITLE_KEY) || 'PomoDash';
    const titleInput = document.getElementById('editableTitle');
    if (titleInput) titleInput.value = saved;
    document.title = saved;
}

export function updatePageTitle(newTitle) {
    document.title = newTitle;
    localStorage.setItem(TITLE_KEY, newTitle);
}