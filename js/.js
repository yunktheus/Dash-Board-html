// ======================== CONSTANTES GLOBAIS ========================
export const daysOrder = ['segunda','terca','quarta','quinta','sexta'];
export const dayNames = {
    segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
    quinta: 'Quinta-feira', sexta: 'Sexta-feira'
};

export const defaultTasks = {
    segunda: [
        { text: "🎯 Revisão rápida (5min)",          done: false },
        { text: "📺 Assistir aula de lógica (20min)", done: false },
        { text: "💻 Prática de código (25min)",       done: false },
        { text: "📝 Resumo e próximo passo (10min)",  done: false }
    ],
    terca: [
        { text: "📈 Planejar estudo de marketing (5min)",       done: false },
        { text: "🎓 Conteúdo teórico: funis/tráfego (25min)",  done: false },
        { text: "✏️ Exercício aplicado (20min)",                done: false },
        { text: "📓 Anotar aprendizados (10min)",               done: false }
    ],
    quarta: [
        { text: "🔄 Revisão rápida (5min)",            done: false },
        { text: "📺 Condicionais (if/else) (20min)",   done: false },
        { text: "💻 Desafio prático (25min)",           done: false },
        { text: "📌 Documentar descobertas (10min)",    done: false }
    ],
    quinta: [
        { text: "📊 Copywriting para conversão (25min)", done: false },
        { text: "📉 Métricas e KPIs (20min)",             done: false },
        { text: "📱 Criação de conteúdo (15min)",         done: false },
        { text: "✅ Checklist da semana (10min)",         done: false }
    ],
    sexta: [
        { text: "🔁 Revisão geral da semana (10min)",  done: false },
        { text: "🚀 Iniciar pequeno projeto (30min)",   done: false },
        { text: "🐞 Debug / Documentação (15min)",      done: false },
        { text: "🏁 Planejar próximos passos (5min)",   done: false }
    ]
};

export function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function genId() {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}