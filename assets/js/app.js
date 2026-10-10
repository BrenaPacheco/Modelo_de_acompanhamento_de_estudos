// app.js

const App = {
    init: () => {
        if (Storage.isFirstRun()) {
            App.showWelcomeScreen();
        } else {
            App.loadApp();
        }
        App.bindGlobalEvents();
    },

    showWelcomeScreen: () => {
        document.getElementById('app-content').innerHTML = `
            <div class="welcome-screen card">
                <h1>Bem-vindo à Minha Trilha de Estudos!</h1>
                <p>Organize seus cursos, acompanhe seu progresso e mantenha um cronograma de estudos.</p>
                <div class="welcome-actions">
                    <button id="btn-load-demo" class="btn primary">Carregar trilha demonstrativa</button>
                    <button id="btn-start-empty" class="btn secondary">Começar do zero</button>
                </div>
            </div>
        `;
        document.getElementById('btn-load-demo').addEventListener('click', () => {
            Storage.initialize(true);
            App.loadApp();
        });
        document.getElementById('btn-start-empty').addEventListener('click', () => {
            Storage.initialize(false);
            App.loadApp();
        });
    },

    loadApp: () => {
        App.renderLayout();
        App.navigate('dashboard');
    },

    renderLayout: () => {
        document.body.innerHTML = `
            <div class="app-container">
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-header">
                        <i data-lucide="book-open"></i>
                        <h2>Minha Trilha</h2>
                    </div>
                    <nav class="sidebar-nav">
                        <a href="#" data-view="dashboard" class="nav-item active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                        <a href="#" data-view="courses" class="nav-item"><i data-lucide="library"></i> Cursos</a>
                        <a href="#" data-view="schedule" class="nav-item"><i data-lucide="calendar"></i> Meu Cronograma</a>
                        <a href="#" data-view="settings" class="nav-item"><i data-lucide="settings"></i> Configurações</a>
                    </nav>
                </aside>
                <main class="main-content">
                    <header class="main-header">
                        <button id="btn-menu-toggle" class="btn-icon" aria-label="Menu"><i data-lucide="menu"></i></button>
                        <h1 id="page-title">Dashboard</h1>
                        <button id="btn-theme-toggle" class="btn-icon" aria-label="Alternar Tema"><i data-lucide="moon"></i></button>
                    </header>
                    <div id="view-container" class="view-container"></div>
                </main>
            </div>
            <!-- Modals Container -->
            <div id="modals-container"></div>
        `;
        
        lucide.createIcons();

        // Bind Nav
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.currentTarget.classList.add('active');
                App.navigate(e.currentTarget.dataset.view);
                // Close sidebar on mobile
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        document.getElementById('btn-menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Theme toggle
        const toggleThemeBtn = document.getElementById('btn-theme-toggle');
        const updateThemeIcon = () => {
            const isDark = document.body.classList.contains('dark-theme');
            toggleThemeBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            lucide.createIcons();
        };
        
        toggleThemeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('mte_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
            updateThemeIcon();
        });

        // Load theme preference
        if (localStorage.getItem('mte_theme') === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (!localStorage.getItem('mte_theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
             document.body.classList.add('dark-theme');
        }
        updateThemeIcon();
    },

    navigate: (view) => {
        const container = document.getElementById('view-container');
        const pageTitle = document.getElementById('page-title');
        
        switch (view) {
            case 'dashboard':
                pageTitle.textContent = "Dashboard";
                App.renderDashboard(container);
                break;
            case 'courses':
                pageTitle.textContent = "Catálogo de Cursos";
                App.renderCoursesView(container);
                break;
            case 'schedule':
                pageTitle.textContent = "Meu Cronograma";
                App.renderScheduleView(container);
                break;
            case 'settings':
                pageTitle.textContent = "Configurações e Dados";
                App.renderSettingsView(container);
                break;
            default:
                container.innerHTML = "<p>Página não encontrada.</p>";
        }
        lucide.createIcons();
    },

    // --- DASHBOARD ---
    renderDashboard: (container) => {
        const stats = CoursesManager.getStats();
        
        let continueHtml = '';
        if (stats.continueCourse) {
            continueHtml = `
                <div class="card continue-card">
                    <h3>Continue Estudando</h3>
                    <p><strong>${Utils.escapeHtml(stats.continueCourse.name)}</strong></p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.continueCourse.progress}%"></div>
                    </div>
                    <p class="text-sm">${stats.continueCourse.progress}% concluído</p>
                    <button class="btn primary mt-3" onclick="App.openCourseURL('${stats.continueCourse.url}')">Acessar Curso</button>
                </div>
            `;
        }

        let deadlineHtml = '';
        if (stats.nextDeadlineCourse) {
            deadlineHtml = `
                <div class="card deadline-card">
                    <h3>Próximo Prazo</h3>
                    <p><strong>${Utils.escapeHtml(stats.nextDeadlineCourse.name)}</strong></p>
                    <p class="text-sm">Prazo: ${Utils.formatDate(stats.nextDeadlineCourse.endDate)}</p>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="book"></i></div>
                    <div class="stat-info">
                        <h3>${stats.total}</h3>
                        <p>Total de Cursos</p>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="clock"></i></div>
                    <div class="stat-info">
                        <h3>${Utils.formatDuration(stats.totalMinutes)}</h3>
                        <p>Horas de Estudo</p>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="bar-chart"></i></div>
                    <div class="stat-info">
                        <h3>${stats.overallProgress}%</h3>
                        <p>Progresso Geral</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-details mt-4">
                <div class="card">
                    <h3>Status dos Cursos</h3>
                    <ul class="status-list mt-3">
                        <li><span class="status-dot not_started"></span> Não Iniciados: ${stats.notStarted}</li>
                        <li><span class="status-dot in_progress"></span> Em Andamento: ${stats.inProgress}</li>
                        <li><span class="status-dot completed"></span> Concluídos: ${stats.completed}</li>
                    </ul>
                </div>
                ${continueHtml}
                ${deadlineHtml}
            </div>
        `;
    },

    openCourseURL: (url) => {
        if (!url) {
            alert("URL não cadastrada para este curso.");
            return;
        }
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'http://' + formattedUrl;
        }
        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    },

    // --- COURSES ---
    renderCoursesView: (container) => {
        container.innerHTML = `
            <div class="courses-toolbar">
                <div class="search-filter">
                    <input type="text" id="search-course" placeholder="Buscar curso..." class="input-field">
                    <select id="filter-status" class="input-field">
                        <option value="">Todos os status</option>
                        <option value="not_started">Não iniciado</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="paused">Pausado</option>
                        <option value="completed">Concluído</option>
                    </select>
                </div>
                <button class="btn primary" onclick="App.showCourseModal()"><i data-lucide="plus"></i> Novo Curso</button>
            </div>
            <div id="courses-list" class="courses-grid mt-4"></div>
        `;
        
        App.renderCoursesList();
        
        document.getElementById('search-course').addEventListener('input', App.renderCoursesList);
        document.getElementById('filter-status').addEventListener('change', App.renderCoursesList);
    },

    renderCoursesList: () => {
        const searchTerm = document.getElementById('search-course').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status').value;
        const listContainer = document.getElementById('courses-list');
        
        let courses = Storage.getCourses();
        
        courses = courses.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm) || (c.category || '').toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === '' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (courses.length === 0) {
            listContainer.innerHTML = `<p class="empty-state">Nenhum curso encontrado.</p>`;
            return;
        }

        listContainer.innerHTML = courses.map(c => `
            <div class="card course-card">
                <div class="course-header">
                    <span class="badge ${c.status}">${Utils.getStatusLabel(c.status)}</span>
                    <div class="course-actions-menu">
                        <button class="btn-icon small" onclick="App.showCourseModal('${c.id}')" title="Editar"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon small" onclick="CoursesManager.duplicateCourse('${c.id}'); App.renderCoursesList(); lucide.createIcons();" title="Duplicar"><i data-lucide="copy"></i></button>
                        <button class="btn-icon small text-danger" onclick="if(confirm('Tem certeza?')) { CoursesManager.deleteCourse('${c.id}'); App.renderCoursesList(); lucide.createIcons(); }" title="Excluir"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <h3 class="course-title mt-2">${Utils.escapeHtml(c.name)}</h3>
                <p class="course-meta">${Utils.escapeHtml(c.institution || '')} • ${Utils.escapeHtml(c.category || '')}</p>
                <p class="course-desc mt-2">${Utils.escapeHtml(c.description || '')}</p>
                
                <div class="course-dates mt-3">
                    <small><i data-lucide="calendar"></i> Início: ${Utils.formatDate(c.startDate) || 'N/D'}</small>
                    <small><i data-lucide="flag"></i> Fim: ${Utils.formatDate(c.endDate) || 'N/D'}</small>
                </div>

                <div class="progress-section mt-3">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${c.progress}%"></div>
                    </div>
                    <small>${c.progress}% concluído</small>
                </div>

                <div class="course-actions mt-4">
                    <button class="btn primary full-width mb-2" onclick="App.openCourseURL('${c.url}')"><i data-lucide="external-link"></i> Acessar Curso</button>
                    <div class="grid-2 gap-2">
                        <button class="btn secondary" onclick="App.showSessionModal('${c.id}')"><i data-lucide="clock"></i> Estudei</button>
                        <button class="btn secondary" onclick="App.showNotesModal('${c.id}')"><i data-lucide="file-text"></i> Notas</button>
                    </div>
                    ${c.status !== 'completed' ? `<button class="btn secondary full-width mt-2" onclick="App.markCourseCompleted('${c.id}')"><i data-lucide="check-circle"></i> Concluir</button>` : ''}
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    markCourseCompleted: (id) => {
        CoursesManager.updateCourse(id, { progress: 100, status: 'completed' });
        App.renderCoursesList();
    },

    // --- MODALS ---
    showCourseModal: (id = null) => {
        let course = id ? Storage.getCourse(id) : null;
        const isNew = !course;
        course = course || { name: '', institution: '', url: '', category: '', startDate: '', endDate: '', description: '', status: 'not_started', progress: 0 };

        const modalHtml = `
            <div class="modal-overlay" id="course-modal">
                <div class="modal-content card">
                    <div class="modal-header">
                        <h2>${isNew ? 'Novo Curso' : 'Editar Curso'}</h2>
                        <button class="btn-icon close-modal"><i data-lucide="x"></i></button>
                    </div>
                    <form id="course-form" class="mt-4">
                        <div class="form-group">
                            <label>Nome do Curso *</label>
                            <input type="text" id="c-name" class="input-field" required value="${Utils.escapeHtml(course.name)}">
                        </div>
                        <div class="grid-2 gap-3">
                            <div class="form-group">
                                <label>Instituição</label>
                                <input type="text" id="c-inst" class="input-field" value="${Utils.escapeHtml(course.institution)}">
                            </div>
                            <div class="form-group">
                                <label>Categoria</label>
                                <input type="text" id="c-cat" class="input-field" value="${Utils.escapeHtml(course.category)}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>URL / Link do Curso</label>
                            <input type="url" id="c-url" class="input-field" value="${Utils.escapeHtml(course.url)}">
                        </div>
                        <div class="grid-2 gap-3">
                            <div class="form-group">
                                <label>Data de Início</label>
                                <input type="date" id="c-start" class="input-field" value="${course.startDate || ''}">
                            </div>
                            <div class="form-group">
                                <label>Prazo de Conclusão</label>
                                <input type="date" id="c-end" class="input-field" value="${course.endDate || ''}">
                            </div>
                        </div>
                        <div class="grid-2 gap-3">
                            <div class="form-group">
                                <label>Status</label>
                                <select id="c-status" class="input-field">
                                    <option value="not_started" ${course.status === 'not_started' ? 'selected' : ''}>Não iniciado</option>
                                    <option value="in_progress" ${course.status === 'in_progress' ? 'selected' : ''}>Em andamento</option>
                                    <option value="paused" ${course.status === 'paused' ? 'selected' : ''}>Pausado</option>
                                    <option value="completed" ${course.status === 'completed' ? 'selected' : ''}>Concluído</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Progresso (%)</label>
                                <input type="number" id="c-prog" class="input-field" min="0" max="100" value="${course.progress}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea id="c-desc" class="input-field" rows="3">${Utils.escapeHtml(course.description)}</textarea>
                        </div>
                        <div class="modal-actions mt-4">
                            <button type="button" class="btn secondary close-modal">Cancelar</button>
                            <button type="submit" class="btn primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modals-container').innerHTML = modalHtml;
        lucide.createIcons();

        const modal = document.getElementById('course-modal');
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        document.getElementById('course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const start = document.getElementById('c-start').value;
            const end = document.getElementById('c-end').value;
            
            if (start && end && !Utils.isValidDateRange(start, end)) {
                alert("A data final não pode ser anterior à data inicial.");
                return;
            }

            const data = {
                name: document.getElementById('c-name').value,
                institution: document.getElementById('c-inst').value,
                category: document.getElementById('c-cat').value,
                url: document.getElementById('c-url').value,
                startDate: start,
                endDate: end,
                status: document.getElementById('c-status').value,
                progress: parseInt(document.getElementById('c-prog').value, 10) || 0,
                description: document.getElementById('c-desc').value
            };

            if (isNew) {
                CoursesManager.addCourse(data);
            } else {
                CoursesManager.updateCourse(id, data);
            }
            
            modal.remove();
            App.renderCoursesList();
        });
    },

    showSessionModal: (courseId) => {
        const course = Storage.getCourse(courseId);
        if (!course) return;

        const today = new Date().toISOString().split('T')[0];

        const modalHtml = `
            <div class="modal-overlay" id="session-modal">
                <div class="modal-content card">
                    <div class="modal-header">
                        <h2>Registrar Sessão: ${Utils.escapeHtml(course.name)}</h2>
                        <button class="btn-icon close-modal"><i data-lucide="x"></i></button>
                    </div>
                    <form id="session-form" class="mt-4">
                        <div class="grid-2 gap-3">
                            <div class="form-group">
                                <label>Data *</label>
                                <input type="date" id="s-date" class="input-field" required value="${today}">
                            </div>
                            <div class="form-group">
                                <label>Duração (minutos) *</label>
                                <input type="number" id="s-dur" class="input-field" required min="1" value="60">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Anotações da Sessão</label>
                            <textarea id="s-notes" class="input-field" rows="3" placeholder="O que você estudou?"></textarea>
                        </div>
                        <div class="modal-actions mt-4">
                            <button type="button" class="btn secondary close-modal">Cancelar</button>
                            <button type="submit" class="btn primary">Salvar Registro</button>
                        </div>
                    </form>
                    
                    <h3 class="mt-4 mb-2">Histórico</h3>
                    <div class="session-history list-container" style="max-height: 200px; overflow-y: auto;">
                        ${(course.sessions && course.sessions.length > 0) ? course.sessions.map(s => `
                            <div class="session-item flex justify-between items-center mb-2 p-2 bg-muted rounded">
                                <div>
                                    <strong>${Utils.formatDate(s.date)}</strong> - ${s.duration} min
                                    ${s.notes ? `<p class="text-sm text-muted m-0">${Utils.escapeHtml(s.notes)}</p>` : ''}
                                </div>
                                <button class="btn-icon small text-danger" onclick="App.deleteSession('${courseId}', '${s.id}')"><i data-lucide="trash-2"></i></button>
                            </div>
                        `).join('') : '<p class="text-sm text-muted">Nenhuma sessão registrada.</p>'}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modals-container').innerHTML = modalHtml;
        lucide.createIcons();

        const modal = document.getElementById('session-modal');
        modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => modal.remove()));

        document.getElementById('session-form').addEventListener('submit', (e) => {
            e.preventDefault();
            CoursesManager.addSession(courseId, {
                date: document.getElementById('s-date').value,
                duration: document.getElementById('s-dur').value,
                notes: document.getElementById('s-notes').value
            });
            App.showSessionModal(courseId); // refresh
            App.renderCoursesList(); // to update status/stats if it changed to in_progress
        });
    },

    deleteSession: (courseId, sessionId) => {
        if (confirm("Excluir este registro?")) {
            CoursesManager.deleteSession(courseId, sessionId);
            App.showSessionModal(courseId);
            App.renderCoursesList();
        }
    },

    showNotesModal: (courseId) => {
        const course = Storage.getCourse(courseId);
        if (!course) return;

        const modalHtml = `
            <div class="modal-overlay" id="notes-modal">
                <div class="modal-content card" style="max-width: 600px; width: 95%;">
                    <div class="modal-header">
                        <h2>Anotações: ${Utils.escapeHtml(course.name)}</h2>
                        <button class="btn-icon close-modal"><i data-lucide="x"></i></button>
                    </div>
                    <div class="notes-container mt-3">
                        <textarea id="course-notes" class="input-field" rows="15" placeholder="Suas anotações (Suporta Markdown simples...)">${Utils.escapeHtml(course.notes || '')}</textarea>
                    </div>
                    <div class="modal-actions mt-4 flex justify-between">
                        <button class="btn secondary" onclick="App.exportNotes('${courseId}')"><i data-lucide="download"></i> Exportar MD</button>
                        <div>
                            <button type="button" class="btn secondary close-modal">Fechar</button>
                            <button class="btn primary" onclick="App.saveNotes('${courseId}')"><i data-lucide="save"></i> Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modals-container').innerHTML = modalHtml;
        lucide.createIcons();

        const modal = document.getElementById('notes-modal');
        modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => modal.remove()));
    },

    saveNotes: (courseId) => {
        const notes = document.getElementById('course-notes').value;
        CoursesManager.updateCourse(courseId, { notes: notes });
        alert("Anotações salvas com sucesso!");
    },

    exportNotes: (courseId) => {
        const course = Storage.getCourse(courseId);
        if (course) {
            const md = `# Anotações: ${course.name}\n\n${course.notes || 'Nenhuma anotação.'}`;
            Utils.downloadFile(`anotacoes_${course.name.replace(/\\s+/g, '_')}.md`, md, 'text/markdown');
        }
    },

    // --- SCHEDULE ---
    renderScheduleView: (container) => {
        const settings = Storage.getSettings();
        
        container.innerHTML = `
            <div class="card mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h3>Configuração do Cronograma</h3>
                    <div>
                        <button class="btn secondary" onclick="Calendar.exportScheduleICS()"><i data-lucide="calendar-days"></i> Exportar ICS Completo</button>
                    </div>
                </div>
                <form id="schedule-form">
                    <p class="text-sm text-muted mb-3">Selecione os dias e horários que você costuma estudar na semana.</p>
                    <div class="schedule-days grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-3">
                        ${[1,2,3,4,5,6,0].map(day => {
                            const daysNames = {1:'Segunda', 2:'Terça', 3:'Quarta', 4:'Quinta', 5:'Sexta', 6:'Sábado', 0:'Domingo'};
                            const sched = (settings.schedule || []).find(s => s.day === day) || { active: false, start: '15:00', duration: 60 };
                            const isActive = !!(settings.schedule || []).find(s => s.day === day);
                            return `
                            <div class="schedule-day-item p-3 border rounded">
                                <label class="flex items-center gap-2 mb-2">
                                    <input type="checkbox" name="sched_day" value="${day}" ${isActive ? 'checked' : ''}>
                                    <strong>${daysNames[day]}</strong>
                                </label>
                                <div class="grid-2 gap-2 ${isActive ? '' : 'disabled-area'}" id="sched-opts-${day}">
                                    <div>
                                        <small>Início</small>
                                        <input type="time" class="input-field" id="sched_start_${day}" value="${sched.start}" ${isActive ? '' : 'disabled'}>
                                    </div>
                                    <div>
                                        <small>Minutos</small>
                                        <input type="number" class="input-field" id="sched_dur_${day}" value="${sched.duration}" min="15" step="15" ${isActive ? '' : 'disabled'}>
                                    </div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="mt-4">
                        <button type="submit" class="btn primary">Salvar Cronograma</button>
                    </div>
                </form>
            </div>

            <div class="card">
                <h3>Próximos Prazos de Cursos</h3>
                <div class="list-container mt-3" id="deadlines-list"></div>
            </div>
        `;
        lucide.createIcons();

        // Enable/disable time inputs based on checkbox
        document.querySelectorAll('input[name="sched_day"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const day = e.target.value;
                const optsArea = document.getElementById(`sched-opts-${day}`);
                const inputs = optsArea.querySelectorAll('input');
                if (e.target.checked) {
                    optsArea.classList.remove('disabled-area');
                    inputs.forEach(i => i.disabled = false);
                } else {
                    optsArea.classList.add('disabled-area');
                    inputs.forEach(i => i.disabled = true);
                }
            });
        });

        document.getElementById('schedule-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newSchedule = [];
            document.querySelectorAll('input[name="sched_day"]:checked').forEach(cb => {
                const day = parseInt(cb.value, 10);
                newSchedule.push({
                    day: day,
                    start: document.getElementById(`sched_start_${day}`).value,
                    duration: parseInt(document.getElementById(`sched_dur_${day}`).value, 10)
                });
            });
            const s = Storage.getSettings();
            s.schedule = newSchedule;
            Storage.saveSettings(s);
            alert("Cronograma salvo!");
        });

        // Render deadlines
        const courses = Storage.getCourses().filter(c => c.endDate && c.status !== 'completed').sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        const dlContainer = document.getElementById('deadlines-list');
        if (courses.length === 0) {
            dlContainer.innerHTML = '<p class="text-muted">Nenhum curso ativo com data de conclusão definida.</p>';
        } else {
            dlContainer.innerHTML = courses.map(c => `
                <div class="flex justify-between items-center p-3 border-bottom">
                    <div>
                        <strong>${Utils.escapeHtml(c.name)}</strong>
                        <p class="text-sm m-0">Prazo: ${Utils.formatDate(c.endDate)}</p>
                    </div>
                    <button class="btn-icon" onclick="Calendar.exportCourseDeadlineICS('${c.id}')" title="Exportar Prazo para Agenda"><i data-lucide="calendar-plus"></i></button>
                </div>
            `).join('');
            lucide.createIcons();
        }
    },

    // --- SETTINGS ---
    renderSettingsView: (container) => {
        container.innerHTML = `
            <div class="card mb-4">
                <h3>Dados Pessoais</h3>
                <p class="text-sm text-muted mt-2">Os dados da "Minha Trilha de Estudos" são salvos localmente no seu navegador (LocalStorage). 
                Eles não são enviados para nenhum servidor externo. Se você limpar os dados do navegador, poderá perder suas informações.</p>
                
                <div class="mt-4 flex gap-3 wrap">
                    <button class="btn primary" onclick="Storage.exportData()"><i data-lucide="download-cloud"></i> Fazer Backup (Exportar JSON)</button>
                    <label class="btn secondary cursor-pointer">
                        <i data-lucide="upload-cloud"></i> Restaurar Backup (Importar JSON)
                        <input type="file" id="import-file" accept=".json" style="display:none">
                    </label>
                </div>
            </div>

            <div class="card border-danger">
                <h3 class="text-danger">Zona de Perigo</h3>
                <p class="mt-2 mb-3">Apagar todos os cursos, cronogramas e anotações. Esta ação não pode ser desfeita.</p>
                <button class="btn danger" onclick="App.clearAllData()"><i data-lucide="alert-triangle"></i> Apagar Todos os Dados</button>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target.result;
                if (confirm("Importar dados substituirá seus cursos atuais. Deseja continuar?")) {
                    if (Storage.importData(content)) {
                        alert("Dados importados com sucesso!");
                        App.loadApp();
                    } else {
                        alert("Erro ao importar dados. Arquivo inválido ou corrompido.");
                    }
                }
            };
            reader.readAsText(file);
        });
    },

    clearAllData: () => {
        if (confirm("TEM CERTEZA ABSOLUTA? Todos os seus dados, cursos e progressos serão apagados permanentemente deste navegador.")) {
            if (confirm("Por favor, confirme novamente para apagar.")) {
                Storage.clearAll();
                window.location.reload();
            }
        }
    },

    bindGlobalEvents: () => {
        // Nothing global missing
    }
};

window.onload = App.init;
