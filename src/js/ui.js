/* 
   CV Vibe - UI Coordinator Module
   Coordinates accordion drawers, dynamic sub-forms (Experience, Education, etc.),
   file upload readers, zoom calculations, styling selectors, and event bindings.
*/

export class CVUI {
    /**
     * @param {CVStore} store 
     */
    constructor(store) {
        this.store = store;
        this.zoom = 0.85; // Initial zoom scale matching desktop view defaults
        
        // Dynamic row counts trackers (for generating unique IDs)
        this.rowCounts = {
            experience: 0,
            education: 0,
            skills: 0,
            projects: 0,
            languages: 0,
            certifications: 0
        };

        this.initDOMElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM targets
     */
    initDOMElements() {
        // Main structural buttons
        this.btnLoadSample = document.getElementById('btn-load-sample');
        this.btnReset = document.getElementById('btn-reset');
        this.btnExportJson = document.getElementById('btn-export-json');
        this.inputImportJson = document.getElementById('input-import-json');
        this.btnToggleTheme = document.getElementById('btn-toggle-editor-theme');
        
        // Style controls
        this.selectTemplate = document.getElementById('select-template');
        this.selectFontCombo = document.getElementById('select-font-combo');
        this.rangeSpacing = document.getElementById('range-spacing');
        this.spacingVal = document.getElementById('spacing-val');
        this.colorPicker = document.getElementById('custom-accent-color');
        this.colorPalettePicker = document.getElementById('color-palette-picker');
        
        // Static Info fields
        this.inputName = document.getElementById('input-name');
        this.inputTitle = document.getElementById('input-title');
        this.inputEmail = document.getElementById('input-email');
        this.inputPhone = document.getElementById('input-phone');
        this.inputAddress = document.getElementById('input-address');
        this.inputWebsite = document.getElementById('input-website');
        this.inputLinkedin = document.getElementById('input-linkedin');
        this.inputGithub = document.getElementById('input-github');
        this.textareaSummary = document.getElementById('textarea-summary');
        
        // Image controls
        this.inputPhoto = document.getElementById('input-photo');
        this.photoPreview = document.getElementById('photo-preview');
        this.btnRemovePhoto = document.getElementById('btn-remove-photo');
        
        // Dynamic List containers
        this.containerExp = document.getElementById('experience-list');
        this.containerEdu = document.getElementById('education-list');
        this.containerSki = document.getElementById('skills-list');
        this.containerProj = document.getElementById('projects-list');
        this.containerLang = document.getElementById('languages-list');
        this.containerCert = document.getElementById('certifications-list');
        
        // Dynamic "Add Row" triggers
        this.btnAddExp = document.getElementById('btn-add-experience');
        this.btnAddEdu = document.getElementById('btn-add-education');
        this.btnAddSki = document.getElementById('btn-add-skill');
        this.btnAddProj = document.getElementById('btn-add-project');
        this.btnAddLang = document.getElementById('btn-add-language');
        this.btnAddCert = document.getElementById('btn-add-certification');

        // Zoom containers & preview targets
        this.btnZoomIn = document.getElementById('btn-zoom-in');
        this.btnZoomOut = document.getElementById('btn-zoom-out');
        this.zoomLabel = document.getElementById('zoom-level');
        this.canvasZoom = document.getElementById('canvas-zoom-container');
        this.cvPage = document.getElementById('cv-preview-document');

        // Responsive tab targets
        this.btnTabEditor = document.getElementById('btn-tab-editor');
        this.btnTabPreview = document.getElementById('btn-tab-preview');
        this.workspace = document.querySelector('.workspace');
    }

    /**
     * Bind all static UI triggers
     */
    bindEvents() {
        // Mobile Tab Switcher events
        if (this.btnTabEditor && this.btnTabPreview && this.workspace) {
            this.btnTabEditor.addEventListener('click', () => {
                this.workspace.classList.remove('view-preview');
                this.workspace.classList.add('view-editor');
                this.btnTabEditor.classList.add('btn-primary', 'active');
                this.btnTabEditor.classList.remove('btn-secondary');
                this.btnTabPreview.classList.add('btn-secondary');
                this.btnTabPreview.classList.remove('btn-primary', 'active');
            });

            this.btnTabPreview.addEventListener('click', () => {
                this.workspace.classList.remove('view-editor');
                this.workspace.classList.add('view-preview');
                this.btnTabPreview.classList.add('btn-primary', 'active');
                this.btnTabPreview.classList.remove('btn-secondary');
                this.btnTabEditor.classList.add('btn-secondary');
                this.btnTabEditor.classList.remove('btn-primary', 'active');
            });
        }

        // 1. Accordion Toggle drawers
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const item = header.closest('.accordion-item');
                const wasExpanded = item.classList.contains('expanded');
                
                // Collapse other siblings for a neat wizard experience (optional, lets keep it collapsible)
                // item.parentElement.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('expanded'));
                
                if (!wasExpanded) {
                    item.classList.add('expanded');
                } else {
                    item.classList.remove('expanded');
                }
            });
        });

        // 2. Editor UI light/dark mode theme toggler
        this.btnToggleTheme.addEventListener('click', () => {
            document.body.classList.toggle('editor-light-mode');
            document.body.classList.toggle('editor-dark-mode');
            
            const isLight = document.body.classList.contains('editor-light-mode');
            this.btnToggleTheme.querySelector('.icon-sun').style.display = isLight ? 'block' : 'none';
            this.btnToggleTheme.querySelector('.icon-moon').style.display = isLight ? 'none' : 'block';
        });

        // 3. Static personal info change events
        const bindStaticField = (element, sectionName, fieldName) => {
            element.addEventListener('input', () => {
                const update = {};
                update[fieldName] = element.value;
                this.store.updateSection(sectionName, update);
            });
        };

        bindStaticField(this.inputName, 'personal', 'name');
        bindStaticField(this.inputTitle, 'personal', 'title');
        bindStaticField(this.inputEmail, 'personal', 'email');
        bindStaticField(this.inputPhone, 'personal', 'phone');
        bindStaticField(this.inputAddress, 'personal', 'address');
        bindStaticField(this.inputWebsite, 'personal', 'website');
        bindStaticField(this.inputLinkedin, 'personal', 'linkedin');
        bindStaticField(this.inputGithub, 'personal', 'github');
        
        // Summary objective
        this.textareaSummary.addEventListener('input', () => {
            this.store.updateSection('summary', this.textareaSummary.value);
        });

        // 4. Styling controls binding
        this.selectTemplate.addEventListener('change', () => {
            this.store.updateSection('style', { template: this.selectTemplate.value });
        });

        this.selectFontCombo.addEventListener('change', () => {
            this.store.updateSection('style', { font: this.selectFontCombo.value });
        });

        this.rangeSpacing.addEventListener('input', () => {
            const val = parseFloat(this.rangeSpacing.value);
            this.spacingVal.textContent = `${val.toFixed(2)}x`;
            this.store.updateSection('style', { spacing: val });
        });

        // 5. Dynamic swatch buttons picker
        this.colorPalettePicker.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.colorPalettePicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const hex = swatch.getAttribute('data-color');
                this.colorPicker.value = hex;
                this.store.updateSection('style', { accentColor: hex });
            });
        });

        // Custom hex color picker
        this.colorPicker.addEventListener('input', () => {
            this.colorPalettePicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            const hex = this.colorPicker.value;
            this.store.updateSection('style', { accentColor: hex });
        });

        // 6. Photo upload actions
        this.inputPhoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 1 * 1024 * 1024) {
                alert('Maksimal ukuran file foto adalah 1MB.');
                this.inputPhoto.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result;
                this.photoPreview.src = base64Data;
                this.btnRemovePhoto.style.display = 'flex';
                this.store.updateSection('personal', { avatar: base64Data });
            };
            reader.readAsDataURL(file);
        });

        this.btnRemovePhoto.addEventListener('click', () => {
            this.inputPhoto.value = '';
            const defaultPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748b'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
            this.photoPreview.src = defaultPlaceholder;
            this.btnRemovePhoto.style.display = 'none';
            this.store.updateSection('personal', { avatar: '' });
        });

        // 7. Dynamic List Add Row listeners
        this.btnAddExp.addEventListener('click', () => this.addExperienceRow());
        this.btnAddEdu.addEventListener('click', () => this.addEducationRow());
        this.btnAddSki.addEventListener('click', () => this.addSkillRow());
        this.btnAddProj.addEventListener('click', () => this.addProjectRow());
        this.btnAddLang.addEventListener('click', () => this.addLanguageRow());
        this.btnAddCert.addEventListener('click', () => this.addCertificationRow());

        // 8. Structural triggers
        this.btnLoadSample.addEventListener('click', () => {
            if (confirm('Apakah Anda ingin memuat data sampel? Ini akan menimpa data yang sedang Anda edit saat ini.')) {
                this.store.loadSampleData();
            }
        });

        this.btnReset.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus seluruh data CV Anda?')) {
                this.store.reset();
            }
        });

        this.btnExportJson.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.store.getState(), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `cv_vibe_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });

        this.inputImportJson.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    this.store.setState(parsed);
                } catch (err) {
                    alert('Gagal mengimpor file. Format JSON tidak valid.');
                }
                this.inputImportJson.value = '';
            };
            reader.readAsText(file);
        });

        // 9. Interactive Zoom Controls
        this.btnZoomIn.addEventListener('click', () => this.updateZoom(0.05));
        this.btnZoomOut.addEventListener('click', () => this.updateZoom(-0.05));
    }

    /**
     * Set zoom levels of A4 preview container
     */
    updateZoom(delta) {
        let newZoom = this.zoom + delta;
        newZoom = Math.min(Math.max(newZoom, 0.4), 1.5); // Cap between 40% and 150%
        this.zoom = newZoom;
        this.zoomLabel.textContent = `${Math.round(newZoom * 100)}%`;
        this.canvasZoom.style.transform = `scale(${newZoom})`;
    }

    /**
     * Dynamic dynamic binding update (Redraws all forms widgets inside the editor panel on data load)
     * @param {Object} state 
     */
    syncFormValues(state) {
        // Sync static inputs
        this.inputName.value = state.personal.name || '';
        this.inputTitle.value = state.personal.title || '';
        this.inputEmail.value = state.personal.email || '';
        this.inputPhone.value = state.personal.phone || '';
        this.inputAddress.value = state.personal.address || '';
        this.inputWebsite.value = state.personal.website || '';
        this.inputLinkedin.value = state.personal.linkedin || '';
        this.inputGithub.value = state.personal.github || '';
        this.textareaSummary.value = state.summary || '';
        
        // Sync photo previews
        if (state.personal.avatar) {
            this.photoPreview.src = state.personal.avatar;
            this.btnRemovePhoto.style.display = 'flex';
        } else {
            const defaultPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748b'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
            this.photoPreview.src = defaultPlaceholder;
            this.btnRemovePhoto.style.display = 'none';
        }

        // Sync layout options
        this.selectTemplate.value = state.style.template;
        this.selectFontCombo.value = state.style.font;
        this.rangeSpacing.value = state.style.spacing;
        this.spacingVal.textContent = `${state.style.spacing.toFixed(2)}x`;

        // Highlight active swatch in picker
        this.colorPalettePicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        const swatchMatch = this.colorPalettePicker.querySelector(`.color-swatch[data-color="${state.style.accentColor}"]`);
        if (swatchMatch) {
            swatchMatch.classList.add('active');
        }
        this.colorPicker.value = state.style.accentColor;

        // Clear dynamic arrays and recreate from state to ensure total sync
        this.containerExp.innerHTML = '';
        this.containerEdu.innerHTML = '';
        this.containerSki.innerHTML = '';
        this.containerProj.innerHTML = '';
        this.containerLang.innerHTML = '';
        this.containerCert.innerHTML = '';

        // Repopulate from state
        state.experience.forEach(item => this.addExperienceRow(item));
        state.education.forEach(item => this.addEducationRow(item));
        state.skills.forEach(item => this.addSkillRow(item));
        state.projects.forEach(item => this.addProjectRow(item));
        state.languages.forEach(item => this.addLanguageRow(item));
        state.certifications.forEach(item => this.addCertificationRow(item));
    }

    /* ==========================================================================
       DYNAMIC ACCORDION CARDS SPAWNERS (EXPERIENCE, EDUCATION, ETC.)
       ========================================================================== */
    
    /**
     * EXPERIENCE ROW CARD CREATION
     */
    addExperienceRow(data = null) {
        const id = data ? data.id : `exp-${++this.rowCounts.experience}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Experience</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="control-group col-span-2">
                    <label>Job Title / Role</label>
                    <input type="text" class="form-control exp-role" placeholder="e.g. Senior Software Engineer" value="${data ? data.role : ''}">
                </div>
                <div class="control-group col-span-2">
                    <label>Company Name</label>
                    <input type="text" class="form-control exp-comp" placeholder="e.g. PT Global Tech" value="${data ? data.company : ''}">
                </div>
                <div class="control-group">
                    <label>Location</label>
                    <input type="text" class="form-control exp-loc" placeholder="e.g. Jakarta" value="${data ? data.location : ''}">
                </div>
                <div class="control-group">
                    <label>Time Period / Date</label>
                    <input type="text" class="form-control exp-date" placeholder="e.g. 2023 - Sekarang" value="${data ? data.date : ''}">
                </div>
                <div class="control-group col-span-2">
                    <label>Description / Key Accomplishments</label>
                    <textarea rows="3" class="form-control exp-desc" placeholder="• Bullet 1... \n• Bullet 2...">${data ? data.desc : ''}</textarea>
                </div>
            </div>
        `;

        // Delete hook
        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('experience');
        });

        // Trigger updates on any child change
        row.querySelectorAll('.form-control').forEach(el => {
            el.addEventListener('input', () => this.triggerStateArrayUpdate('experience'));
        });

        this.containerExp.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('experience'); // Trigger new row initialization
    }

    /**
     * EDUCATION ROW CARD CREATION
     */
    addEducationRow(data = null) {
        const id = data ? data.id : `edu-${++this.rowCounts.education}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Education</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="control-group col-span-2">
                    <label>Degree / Major</label>
                    <input type="text" class="form-control edu-degree" placeholder="e.g. Sarjana Komputer" value="${data ? data.degree : ''}">
                </div>
                <div class="control-group col-span-2">
                    <label>School / University Name</label>
                    <input type="text" class="form-control edu-school" placeholder="e.g. Universitas Indonesia" value="${data ? data.school : ''}">
                </div>
                <div class="control-group">
                    <label>Location</label>
                    <input type="text" class="form-control edu-loc" placeholder="e.g. Depok" value="${data ? data.location : ''}">
                </div>
                <div class="control-group">
                    <label>Graduation Year / Period</label>
                    <input type="text" class="form-control edu-date" placeholder="e.g. 2016 - 2020" value="${data ? data.date : ''}">
                </div>
                <div class="control-group col-span-2">
                    <label>Additional details (GPA, Award)</label>
                    <input type="text" class="form-control edu-desc" placeholder="e.g. IPK: 3.82" value="${data ? data.desc : ''}">
                </div>
            </div>
        `;

        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('education');
        });

        row.querySelectorAll('.form-control').forEach(el => {
            el.addEventListener('input', () => this.triggerStateArrayUpdate('education'));
        });

        this.containerEdu.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('education');
    }

    /**
     * SKILL ROW CARD CREATION
     */
    addSkillRow(data = null) {
        const id = data ? data.id : `ski-${++this.rowCounts.skills}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Skillset</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="control-group">
                    <label>Skill Name</label>
                    <input type="text" class="form-control ski-name" placeholder="e.g. React" value="${data ? data.name : ''}">
                </div>
                <div class="control-group">
                    <label>Proficiency Level (%)</label>
                    <div class="skill-proficiency-wrapper">
                        <input type="range" class="range-slider ski-level" min="10" max="100" step="5" value="${data ? data.level : '80'}">
                        <span class="range-value ski-level-text">${data ? data.level : '80'}%</span>
                    </div>
                </div>
            </div>
        `;

        const slider = row.querySelector('.ski-level');
        const textVal = row.querySelector('.ski-level-text');
        
        slider.addEventListener('input', () => {
            textVal.textContent = `${slider.value}%`;
            this.triggerStateArrayUpdate('skills');
        });

        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('skills');
        });

        row.querySelector('.ski-name').addEventListener('input', () => this.triggerStateArrayUpdate('skills'));

        this.containerSki.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('skills');
    }

    /**
     * PROJECT ROW CARD CREATION
     */
    addProjectRow(data = null) {
        const id = data ? data.id : `proj-${++this.rowCounts.projects}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Project</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="control-group col-span-2">
                    <label>Project Name</label>
                    <input type="text" class="form-control proj-name" placeholder="e.g. VibeCart System" value="${data ? data.name : ''}">
                </div>
                <div class="control-group">
                    <label>Your Role</label>
                    <input type="text" class="form-control proj-role" placeholder="e.g. Lead Architect" value="${data ? data.role : ''}">
                </div>
                <div class="control-group">
                    <label>Project Link / URL</label>
                    <input type="url" class="form-control proj-link" placeholder="e.g. https://github.com/..." value="${data ? data.link : ''}">
                </div>
                <div class="control-group col-span-2">
                    <label>Project Description</label>
                    <input type="text" class="form-control proj-desc" placeholder="Describe goals, techs used, or outcomes..." value="${data ? data.desc : ''}">
                </div>
            </div>
        `;

        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('projects');
        });

        row.querySelectorAll('.form-control').forEach(el => {
            el.addEventListener('input', () => this.triggerStateArrayUpdate('projects'));
        });

        this.containerProj.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('projects');
    }

    /**
     * LANGUAGE ROW CARD CREATION
     */
    addLanguageRow(data = null) {
        const id = data ? data.id : `lan-${++this.rowCounts.languages}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Language</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="control-group">
                    <label>Language Name</label>
                    <input type="text" class="form-control lang-name" placeholder="e.g. English" value="${data ? data.name : ''}">
                </div>
                <div class="control-group">
                    <label>Proficiency</label>
                    <input type="text" class="form-control lang-level" placeholder="e.g. Full Professional / TOEFL 600" value="${data ? data.level : ''}">
                </div>
            </div>
        `;

        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('languages');
        });

        row.querySelectorAll('.form-control').forEach(el => {
            el.addEventListener('input', () => this.triggerStateArrayUpdate('languages'));
        });

        this.containerLang.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('languages');
    }

    /**
     * CERTIFICATION ROW CARD CREATION
     */
    addCertificationRow(data = null) {
        const id = data ? data.id : `cer-${++this.rowCounts.certifications}`;
        
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="dynamic-row-header">
                <span class="dynamic-row-title">Certification / Award</span>
                <button type="button" class="btn-delete-row"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="control-group">
                <label>Certification Title & Issuer</label>
                <input type="text" class="form-control cert-name" placeholder="e.g. AWS Certified Developer (2025)" value="${data ? data.name : ''}">
            </div>
        `;

        row.querySelector('.btn-delete-row').addEventListener('click', () => {
            row.remove();
            this.triggerStateArrayUpdate('certifications');
        });

        row.querySelector('.cert-name').addEventListener('input', () => this.triggerStateArrayUpdate('certifications'));

        this.containerCert.appendChild(row);
        if (!data) this.triggerStateArrayUpdate('certifications');
    }

    /**
     * Map dynamic row panels to JSON structures and update store state
     * @param {string} arrayName 
     */
    triggerStateArrayUpdate(arrayName) {
        let updatedList = [];

        if (arrayName === 'experience') {
            this.containerExp.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    role: row.querySelector('.exp-role').value,
                    company: row.querySelector('.exp-comp').value,
                    location: row.querySelector('.exp-loc').value,
                    date: row.querySelector('.exp-date').value,
                    desc: row.querySelector('.exp-desc').value
                });
            });
        } 
        
        else if (arrayName === 'education') {
            this.containerEdu.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    degree: row.querySelector('.edu-degree').value,
                    school: row.querySelector('.edu-school').value,
                    location: row.querySelector('.edu-loc').value,
                    date: row.querySelector('.edu-date').value,
                    desc: row.querySelector('.edu-desc').value
                });
            });
        } 
        
        else if (arrayName === 'skills') {
            this.containerSki.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    name: row.querySelector('.ski-name').value,
                    level: row.querySelector('.ski-level').value
                });
            });
        } 
        
        else if (arrayName === 'projects') {
            this.containerProj.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    name: row.querySelector('.proj-name').value,
                    role: row.querySelector('.proj-role').value,
                    link: row.querySelector('.proj-link').value,
                    desc: row.querySelector('.proj-desc').value
                });
            });
        } 
        
        else if (arrayName === 'languages') {
            this.containerLang.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    name: row.querySelector('.lang-name').value,
                    level: row.querySelector('.lang-level').value
                });
            });
        } 
        
        else if (arrayName === 'certifications') {
            this.containerCert.querySelectorAll('.dynamic-row').forEach(row => {
                updatedList.push({
                    id: row.getAttribute('data-id'),
                    name: row.querySelector('.cert-name').value
                });
            });
        }

        this.store.updateSection(arrayName, updatedList);
    }
}
