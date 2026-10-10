// utils.js

const Utils = {
    // Generate an ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    // Escape HTML to prevent XSS
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe
             .toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    },

    // Format date string to DD/MM/YYYY
    formatDate: (dateString) => {
        if (!dateString) return '';
        // Create date appending time to avoid UTC shift
        const date = new Date(dateString + 'T12:00:00');
        return date.toLocaleDateString('pt-BR');
    },

    // Calculate progress based on status and manual progress
    calculateProgress: (status, progress) => {
        if (status === 'completed') return 100;
        if (status === 'not_started') return 0;
        return progress || 0;
    },

    // Get status label in pt-br
    getStatusLabel: (status) => {
        const statuses = {
            'not_started': 'Não iniciado',
            'in_progress': 'Em andamento',
            'paused': 'Pausado',
            'completed': 'Concluído'
        };
        return statuses[status] || status;
    },

    // Format minutes into HH:MM
    formatDuration: (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h${m}m`;
    },

    // Download a string as a file
    downloadFile: (filename, text, type = 'text/plain') => {
        const blob = new Blob([text], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // Parse YYYY-MM-DD into a localized display
    parseInputDate: (dateString) => {
        if (!dateString) return null;
        return new Date(dateString + 'T12:00:00');
    },

    // Check if end date is after start date
    isValidDateRange: (start, end) => {
        if (!start || !end) return true;
        return new Date(start) <= new Date(end);
    }
};

window.Utils = Utils;
