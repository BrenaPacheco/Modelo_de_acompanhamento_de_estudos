// storage.js

const Storage = {
    KEYS: {
        COURSES: 'mte_courses',
        SETTINGS: 'mte_settings',
        INITIALIZED: 'mte_initialized'
    },

    // Check if it's the first time running
    isFirstRun: () => {
        return !localStorage.getItem(Storage.KEYS.INITIALIZED);
    },

    // Initialize with demo data or empty
    initialize: (useDemoData) => {
        if (useDemoData && window.INITIAL_COURSES) {
            localStorage.setItem(Storage.KEYS.COURSES, JSON.stringify(window.INITIAL_COURSES));
        } else {
            localStorage.setItem(Storage.KEYS.COURSES, JSON.stringify([]));
        }
        // Default settings
        const defaultSettings = {
            schedule: [
                { day: 1, start: "15:00", duration: 60 }, // Monday
                { day: 3, start: "15:00", duration: 60 }, // Wednesday
                { day: 5, start: "15:00", duration: 60 }  // Friday
            ],
            timezone: "America/Manaus"
        };
        localStorage.setItem(Storage.KEYS.SETTINGS, JSON.stringify(defaultSettings));
        localStorage.setItem(Storage.KEYS.INITIALIZED, 'true');
    },

    // Get all courses
    getCourses: () => {
        try {
            const data = localStorage.getItem(Storage.KEYS.COURSES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading courses from storage", e);
            return [];
        }
    },

    // Save all courses
    saveCourses: (courses) => {
        localStorage.setItem(Storage.KEYS.COURSES, JSON.stringify(courses));
    },

    // Get settings
    getSettings: () => {
        try {
            const data = localStorage.getItem(Storage.KEYS.SETTINGS);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error reading settings", e);
            return {};
        }
    },

    // Save settings
    saveSettings: (settings) => {
        localStorage.setItem(Storage.KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Get a specific course
    getCourse: (id) => {
        const courses = Storage.getCourses();
        return courses.find(c => c.id === id);
    },

    // Clear all data
    clearAll: () => {
        localStorage.removeItem(Storage.KEYS.COURSES);
        localStorage.removeItem(Storage.KEYS.SETTINGS);
        localStorage.removeItem(Storage.KEYS.INITIALIZED);
    },

    // Export Data to JSON
    exportData: () => {
        const data = {
            courses: Storage.getCourses(),
            settings: Storage.getSettings(),
            exportDate: new Date().toISOString()
        };
        const json = JSON.stringify(data, null, 2);
        Utils.downloadFile(`mte_backup_${new Date().toISOString().split('T')[0]}.json`, json, 'application/json');
    },

    // Import Data from JSON string
    importData: (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (data.courses && Array.isArray(data.courses)) {
                Storage.saveCourses(data.courses);
                if (data.settings) {
                    Storage.saveSettings(data.settings);
                }
                localStorage.setItem(Storage.KEYS.INITIALIZED, 'true');
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to parse import data", e);
            return false;
        }
    }
};

window.Storage = Storage;
