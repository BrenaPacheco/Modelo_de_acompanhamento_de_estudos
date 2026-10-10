// calendar.js

const Calendar = {
    // Generate ICS content
    generateICS: (events) => {
        let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Minha Trilha de Estudos//BR\nCALSCALE:GREGORIAN\n";
        
        events.forEach(ev => {
            const startDateICS = Calendar.formatDateToICS(ev.startDate);
            const endDateICS = Calendar.formatDateToICS(ev.endDate);
            const nowICS = Calendar.formatDateToICS(new Date());

            ics += "BEGIN:VEVENT\n";
            ics += `UID:${Utils.generateId()}@minhatrilha.local\n`;
            ics += `DTSTAMP:${nowICS}\n`;
            ics += `DTSTART:${startDateICS}\n`;
            ics += `DTEND:${endDateICS}\n`;
            ics += `SUMMARY:${ev.title}\n`;
            ics += `DESCRIPTION:${ev.description}\n`;
            
            // Morning Reminder (9 AM on the day of the event)
            const morningReminder = new Date(ev.startDate);
            morningReminder.setHours(9, 0, 0, 0);
            if (morningReminder < ev.startDate) {
                 // only if 9am is before the actual event
                const diffMs = ev.startDate.getTime() - morningReminder.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                ics += "BEGIN:VALARM\n";
                ics += "ACTION:DISPLAY\n";
                ics += "DESCRIPTION:Lembrete de estudo\n";
                ics += `TRIGGER:-PT${diffMins}M\n`;
                ics += "END:VALARM\n";
            }

            // At start time reminder
            ics += "BEGIN:VALARM\n";
            ics += "ACTION:DISPLAY\n";
            ics += "DESCRIPTION:Início do estudo\n";
            ics += "TRIGGER:-PT0M\n";
            ics += "END:VALARM\n";

            ics += "END:VEVENT\n";
        });
        
        ics += "END:VCALENDAR";
        return ics;
    },

    formatDateToICS: (date) => {
        // Output format: YYYYMMDDTHHMMSSZ (UTC)
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
    },

    exportScheduleICS: () => {
        const courses = Storage.getCourses().filter(c => c.status === 'not_started' || c.status === 'in_progress');
        const settings = Storage.getSettings();
        
        // Generate upcoming sessions based on schedule for the next 4 weeks
        const events = [];
        const today = new Date();
        const endOfGeneration = new Date();
        endOfGeneration.setDate(today.getDate() + 28); // 4 weeks

        // Basic assignment of sessions to active courses (round robin)
        if (courses.length === 0 || !settings.schedule || settings.schedule.length === 0) {
            alert("Nenhum curso ativo ou cronograma configurado.");
            return;
        }

        let currentCourseIdx = 0;
        
        for (let d = new Date(today); d <= endOfGeneration; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const sched = settings.schedule.find(s => s.day === dayOfWeek);
            if (sched) {
                // Find a course that hasn't ended yet
                let targetCourse = null;
                let attempts = 0;
                while (attempts < courses.length) {
                    const candidate = courses[currentCourseIdx];
                    if (!candidate.endDate || new Date(candidate.endDate + 'T23:59:59') >= d) {
                        targetCourse = candidate;
                        break;
                    }
                    currentCourseIdx = (currentCourseIdx + 1) % courses.length;
                    attempts++;
                }

                if (targetCourse) {
                    const [h, m] = sched.start.split(':').map(Number);
                    const startDate = new Date(d);
                    startDate.setHours(h, m, 0, 0);
                    
                    const endDate = new Date(startDate);
                    endDate.setMinutes(endDate.getMinutes() + sched.duration);

                    events.push({
                        title: `Estudo: ${targetCourse.name}`,
                        description: `Curso: ${targetCourse.name}\\nURL: ${targetCourse.url || 'N/A'}\\n\\nGerado por Minha Trilha de Estudos`,
                        startDate: startDate,
                        endDate: endDate
                    });
                    currentCourseIdx = (currentCourseIdx + 1) % courses.length;
                }
            }
        }

        if (events.length === 0) {
            alert("Nenhuma sessão agendada pôde ser criada (verifique as datas de término dos cursos).");
            return;
        }

        const icsContent = Calendar.generateICS(events);
        Utils.downloadFile('meu_cronograma.ics', icsContent, 'text/calendar');
    },

    exportCourseDeadlineICS: (courseId) => {
        const course = Storage.getCourse(courseId);
        if (!course || !course.endDate) {
            alert("Curso sem data de conclusão.");
            return;
        }
        
        const endDate = new Date(course.endDate + 'T23:59:59');
        const startDate = new Date(course.endDate + 'T00:00:00'); // all day event basically

        const events = [{
            title: `Prazo Final: ${course.name}`,
            description: `Último dia para concluir o curso: ${course.name}\\nURL: ${course.url || 'N/A'}`,
            startDate: startDate,
            endDate: endDate
        }];

        const icsContent = Calendar.generateICS(events);
        Utils.downloadFile(`prazo_${course.id}.ics`, icsContent, 'text/calendar');
    },

    // For single session export to Google Calendar
    generateGoogleCalendarUrl: (title, desc, start, end) => {
        const formatForGCal = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            details: desc,
            dates: `${formatForGCal(start)}/${formatForGCal(end)}`
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }
};

window.Calendar = Calendar;
