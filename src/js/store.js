/* 
   CV Vibe - Data Store Module
   Manages CV schema, state modifications, auto-save (localStorage), JSON backups, and sample data.
*/

export const DEFAULT_STYLE = {
    template: 'executive',
    font: 'modern',
    accentColor: '#0f172a',
    spacing: 1.0
};

export const INITIAL_STATE = {
    personal: {
        name: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        linkedin: '',
        github: '',
        avatar: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    style: { ...DEFAULT_STYLE }
};

export class CVStore {
    constructor() {
        this.STORAGE_KEY = 'cv_vibe_state_data';
        this.state = this.loadFromStorage() || { ...INITIAL_STATE };
        this.listeners = [];
    }

    /**
     * Subscribe to state updates
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all subscribers of state change
     * @param {boolean} fullSync - True if the entire form needs re-syncing (e.g. sample load or reset)
     */
    notify(fullSync = false) {
        this.saveToStorage();
        for (const listener of this.listeners) {
            listener(this.getState(), fullSync);
        }
    }

    /**
     * Get a copy of the current state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Update a nested section of the state
     */
    updateSection(section, data) {
        if (this.state[section] !== undefined) {
            if (typeof data === 'object' && !Array.isArray(data)) {
                this.state[section] = { ...this.state[section], ...data };
            } else {
                this.state[section] = data;
            }
            this.notify(false); // Direct keyboard inputs do not require a full accordion rebuild
        }
    }

    /**
     * Direct state overwrite (e.g. for loading samples or imports)
     */
    setState(newState) {
        // Deep validate schema presence to prevent crashes
        this.state = {
            personal: { ...INITIAL_STATE.personal, ...(newState.personal || {}) },
            summary: newState.summary || '',
            experience: newState.experience || [],
            education: newState.education || [],
            skills: newState.skills || [],
            projects: newState.projects || [],
            languages: newState.languages || [],
            certifications: newState.certifications || [],
            style: { ...DEFAULT_STYLE, ...(newState.style || {}) }
        };
        this.notify(true); // Full sync form elements
    }

    /**
     * Clear all state values
     */
    reset() {
        this.setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
    }

    /**
     * Save current state to LocalStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    /**
     * Load state from LocalStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    }

    /**
     * Load mock sample data of a high-achieving Senior Software Engineer
     */
    loadSampleData() {
        const sample = {
            personal: {
                name: 'Reynaldi Wijaya, S.Kom.',
                title: 'Senior Full Stack Software Engineer',
                email: 'reynaldi.wijaya@outlook.com',
                phone: '+62 812-9876-5432',
                address: 'Jakarta Selatan, Indonesia',
                website: 'https://reynaldi.dev',
                linkedin: 'https://linkedin.com/in/reynaldiwijaya',
                github: 'https://github.com/reynaldi-wijaya',
                avatar: '' // Will use default placeholder icon or placeholder image
            },
            summary: 'Senior Full-Stack Engineer dengan pengalaman 6+ tahun dalam membangun aplikasi web skala enterprise yang scalable, berkinerja tinggi, dan user-centric. Ahli dalam merancang arsitektur microservices modern menggunakan React, Node.js, Python, dan arsitektur cloud AWS. Memiliki rekam jejak sukses memimpin tim developer beranggotakan 6 orang untuk menghemat latensi loading data backend sebesar 40%.',
            experience: [
                {
                    id: 'exp-1',
                    role: 'Lead Full Stack Developer',
                    company: 'PT Global Tech Solution',
                    location: 'Jakarta, Indonesia',
                    date: '2023 - Sekarang',
                    desc: '• Memimpin arsitektur sistem modular berskala besar dengan React, Next.js, dan TypeScript yang melayani lebih dari 100,000 pengguna aktif bulanan.\n• Mengurangi beban loading database server sebesar 30% dengan memprogram REST API caching layer di Node.js menggunakan Redis.\n• Mengarahkan 6 developer junior dalam menerapkan Agile Scrum dan CI/CD pipeline otomatis (GitHub Actions, Docker, dan AWS ECS).'
                },
                {
                    id: 'exp-2',
                    role: 'Senior Software Engineer',
                    company: 'Nusantara Creative Labs',
                    location: 'Bandung, Indonesia',
                    date: '2020 - 2023',
                    desc: '• Merancang ulang dan mengembangkan kembali sistem e-commerce warisan (legacy) menjadi web modular responsif, meningkatkan conversion rate penjualan sebesar 18%.\n• Mengimplementasikan realtime dashboard dengan WebSockets dan visualisasi grafis interaktif D3.js.\n• Berkolaborasi erat dengan tim UI/UX Designer untuk membuat component library internal berbasis Vanilla CSS variables.'
                }
            ],
            education: [
                {
                    id: 'edu-1',
                    degree: 'Sarjana Komputer (S.Kom.) - Teknik Informatika',
                    school: 'Universitas Indonesia',
                    location: 'Depok, Indonesia',
                    date: '2016 - 2020',
                    desc: 'IPK: 3.82 / 4.00 (Predikat Cum Laude). Fokus Riset: Distributed Databases & Cloud Computing.'
                }
            ],
            skills: [
                { id: 'ski-1', name: 'JavaScript / TypeScript', level: '95' },
                { id: 'ski-2', name: 'React / Next.js', level: '90' },
                { id: 'ski-3', name: 'Node.js (Express/NestJS)', level: '85' },
                { id: 'ski-4', name: 'Python (Django/FastAPI)', level: '80' },
                { id: 'ski-5', name: 'Docker / Kubernetes', level: '75' },
                { id: 'ski-6', name: 'AWS Cloud Services', level: '80' }
            ],
            projects: [
                {
                    id: 'proj-1',
                    name: 'VibeCart - High Scalable E-commerce',
                    role: 'Lead Architect',
                    link: 'https://github.com/reynaldi/vibecart',
                    desc: 'Aplikasi belanja modern dengan sistem cart caching tangguh, multi-payment gateway integration (Midtrans), dan serverless backend.'
                },
                {
                    id: 'proj-2',
                    name: 'PulseFlow - Realtime Task Manager',
                    role: 'Creator & Maintainer',
                    link: 'https://github.com/reynaldi/pulseflow',
                    desc: 'Aplikasi produktivitas berbasis kanban board dengan sinkronisasi instan via WebSockets, mendukung drag and drop intuitif.'
                }
            ],
            languages: [
                { id: 'lan-1', name: 'Bahasa Indonesia', level: 'Native / Bilingual' },
                { id: 'lan-2', name: 'English', level: 'Professional Working Proficiency (TOEFL 610)' }
            ],
            certifications: [
                { id: 'cer-1', name: 'AWS Certified Solutions Architect – Associate (2025)' },
                { id: 'cer-2', name: 'Oracle Certified Professional Java SE Programmer (2022)' }
            ],
            style: {
                template: 'executive',
                font: 'modern',
                accentColor: '#1e3a8a', // Corporate Blue
                spacing: 0.95
            }
        };
        this.setState(sample);
    }
}
