// courses.js

const CoursesManager = {
    addCourse: (courseData) => {
        const courses = Storage.getCourses();
        const newCourse = {
            id: Utils.generateId(),
            ...courseData,
            progress: 0,
            status: 'not_started',
            sessions: [],
            notes: ''
        };
        courses.push(newCourse);
        // Sort by start date as a default order
        courses.sort((a, b) => new Date(a.startDate || '9999') - new Date(b.startDate || '9999'));
        Storage.saveCourses(courses);
        return newCourse;
    },

    updateCourse: (id, updates) => {
        const courses = Storage.getCourses();
        const idx = courses.findIndex(c => c.id === id);
        if (idx !== -1) {
            courses[idx] = { ...courses[idx], ...updates };
            
            // Auto-update status based on progress if completed
            if (updates.progress === 100) {
                courses[idx].status = 'completed';
            } else if (updates.progress > 0 && courses[idx].status === 'not_started') {
                courses[idx].status = 'in_progress';
            }

            Storage.saveCourses(courses);
            return courses[idx];
        }
        return null;
    },

    deleteCourse: (id) => {
        const courses = Storage.getCourses();
        const newCourses = courses.filter(c => c.id !== id);
        Storage.saveCourses(newCourses);
    },

    duplicateCourse: (id) => {
        const courses = Storage.getCourses();
        const courseToDuplicate = courses.find(c => c.id === id);
        if (courseToDuplicate) {
            const newCourse = {
                ...courseToDuplicate,
                id: Utils.generateId(),
                name: `${courseToDuplicate.name} (Cópia)`,
                status: 'not_started',
                progress: 0,
                sessions: [],
                notes: ''
            };
            courses.push(newCourse);
            Storage.saveCourses(courses);
        }
    },

    addSession: (courseId, sessionData) => {
        const courses = Storage.getCourses();
        const idx = courses.findIndex(c => c.id === courseId);
        if (idx !== -1) {
            const session = {
                id: Utils.generateId(),
                date: sessionData.date, // YYYY-MM-DD format ideally
                duration: parseInt(sessionData.duration, 10), // in minutes
                notes: sessionData.notes || ''
            };
            
            if (!courses[idx].sessions) courses[idx].sessions = [];
            courses[idx].sessions.push(session);
            
            if (courses[idx].status === 'not_started') {
                courses[idx].status = 'in_progress';
            }
            
            Storage.saveCourses(courses);
            return true;
        }
        return false;
    },

    deleteSession: (courseId, sessionId) => {
        const courses = Storage.getCourses();
        const idx = courses.findIndex(c => c.id === courseId);
        if (idx !== -1 && courses[idx].sessions) {
            courses[idx].sessions = courses[idx].sessions.filter(s => s.id !== sessionId);
            Storage.saveCourses(courses);
        }
    },

    getTotalStudiedMinutes: () => {
        const courses = Storage.getCourses();
        let total = 0;
        courses.forEach(c => {
            if (c.sessions) {
                c.sessions.forEach(s => total += (s.duration || 0));
            }
        });
        return total;
    },
    
    getStats: () => {
        const courses = Storage.getCourses();
        const total = courses.length;
        let notStarted = 0;
        let inProgress = 0;
        let completed = 0;
        let totalProgress = 0;

        courses.forEach(c => {
            if (c.status === 'not_started') notStarted++;
            else if (c.status === 'in_progress' || c.status === 'paused') inProgress++;
            else if (c.status === 'completed') completed++;
            
            totalProgress += (c.progress || 0);
        });

        const overallProgress = total === 0 ? 0 : Math.round(totalProgress / total);

        // find next deadline
        let nextDeadlineCourse = null;
        const now = new Date();
        const upcoming = courses
            .filter(c => c.endDate && c.status !== 'completed' && new Date(c.endDate + 'T23:59:59') >= now)
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        if (upcoming.length > 0) nextDeadlineCourse = upcoming[0];

        // find course in progress with latest session
        const inProgressCourses = courses.filter(c => c.status === 'in_progress');
        let continueCourse = null;
        if (inProgressCourses.length > 0) {
            continueCourse = inProgressCourses[0]; // fallback to first
        }

        return {
            total,
            notStarted,
            inProgress,
            completed,
            overallProgress,
            nextDeadlineCourse,
            continueCourse,
            totalMinutes: CoursesManager.getTotalStudiedMinutes()
        };
    }
};

window.CoursesManager = CoursesManager;
