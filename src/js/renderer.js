/* 
   CV Vibe - Dynamic HTML Template Compiler
   Translates CV state JSON into semantically accurate HTML code, 
   maps typography scales, generates RGBA accents, and handles empty properties.
*/

/**
 * Utility to convert Hex color strings into transparent RGBA variables
 */
function hexToRGBA(hex, alpha) {
    let r = 15, g = 23, b = 42; // Fallback slate blue
    try {
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
    } catch (e) {
        console.error('Hex conversion error:', e);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Typography combination definitions
 */
const FONT_MAPS = {
    modern: {
        heading: "'Poppins', sans-serif",
        body: "'Inter', sans-serif"
    },
    elegant: {
        heading: "'Merriweather', serif",
        body: "'Lora', serif"
    },
    clean: {
        heading: "'Roboto', sans-serif",
        body: "'Inter', sans-serif"
    }
};

/**
 * Primary template rendering router
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export function renderCV(container, state) {
    if (!container) return;
    
    const { personal, summary, experience, education, skills, projects, languages, certifications, style } = state;
    
    // 1. Setup Document Variables
    container.className = `cv-page template-${style.template}`;
    
    // Apply styling tokens directly on A4 parent element to keep editor untouched
    container.style.setProperty('--cv-accent-color', style.accentColor);
    container.style.setProperty('--cv-accent-light', hexToRGBA(style.accentColor, 0.08));
    container.style.setProperty('--cv-spacing-scale', style.spacing);
    
    const fontSet = FONT_MAPS[style.font] || FONT_MAPS.modern;
    container.style.setProperty('--cv-font-heading', fontSet.heading);
    container.style.setProperty('--cv-font-body', fontSet.body);

    // 2. Routing compiled code based on template
    switch(style.template) {
        case 'academic':
            container.innerHTML = compileAcademic(personal, summary, experience, education, skills, projects, languages, certifications);
            break;
        case 'creative':
            container.innerHTML = compileCreative(personal, summary, experience, education, skills, projects, languages, certifications);
            break;
        case 'tech':
            container.innerHTML = compileTech(personal, summary, experience, education, skills, projects, languages, certifications);
            break;
        case 'executive':
        default:
            container.innerHTML = compileExecutive(personal, summary, experience, education, skills, projects, languages, certifications);
            break;
    }
}

/* ==========================================================================
   TEMPLATE 1: THE EXECUTIVE COMPILER (Modern Two-Column)
   ========================================================================== */
function compileExecutive(personal, summary, experience, education, skills, projects, languages, certifications) {
    // Left Sidebar Compilation
    let sidebarHTML = '<div class="executive-sidebar">';
    
    // Avatar
    if (personal.avatar) {
        sidebarHTML += `<img class="executive-avatar" src="${personal.avatar}" alt="${personal.name || 'Resume Avatar'}">`;
    }
    
    // Contact Section
    const contactItems = [];
    if (personal.phone) contactItems.push(`<li><i class="fa-solid fa-phone"></i> ${personal.phone}</li>`);
    if (personal.email) contactItems.push(`<li><i class="fa-solid fa-envelope"></i> <a href="mailto:${personal.email}">${personal.email}</a></li>`);
    if (personal.address) contactItems.push(`<li><i class="fa-solid fa-location-dot"></i> ${personal.address}</li>`);
    if (personal.website) {
        const cleanLink = personal.website.replace(/(^\w+:|^)\/\//, '');
        contactItems.push(`<li><i class="fa-solid fa-globe"></i> <a href="${personal.website}" target="_blank">${cleanLink}</a></li>`);
    }
    if (personal.linkedin) {
        const handle = personal.linkedin.split('/in/')[1] || 'LinkedIn';
        contactItems.push(`<li><i class="fa-brands fa-linkedin"></i> <a href="${personal.linkedin}" target="_blank">in/${handle.replace(/\/$/, '')}</a></li>`);
    }
    if (personal.github) {
        const handle = personal.github.split('github.com/')[1] || 'GitHub';
        contactItems.push(`<li><i class="fa-brands fa-github"></i> <a href="${personal.github}" target="_blank">@${handle.replace(/\/$/, '')}</a></li>`);
    }

    if (contactItems.length > 0) {
        sidebarHTML += `
            <div class="executive-sidebar-section">
                <h4 class="executive-side-title">Hubungi Saya</h4>
                <ul class="executive-contact-list">${contactItems.join('')}</ul>
            </div>
        `;
    }

    // Skills Sidebar
    if (skills.length > 0) {
        const skillsRows = skills.map(ski => {
            if (!ski.name) return '';
            return `
                <div class="executive-skill-row">
                    <div class="executive-skill-name">
                        <span>${ski.name}</span>
                        <span>${ski.level}%</span>
                    </div>
                    <div class="executive-skill-bar-wrapper">
                        <div class="executive-skill-bar-fill" style="width: ${ski.level}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        sidebarHTML += `
            <div class="executive-sidebar-section">
                <h4 class="executive-side-title">Keahlian</h4>
                <div>${skillsRows}</div>
            </div>
        `;
    }

    // Languages Sidebar
    if (languages.length > 0) {
        const langRows = languages.map(lang => {
            if (!lang.name) return '';
            return `
                <div class="executive-lang-row">
                    <span class="executive-lang-name">${lang.name}</span>
                    <span class="executive-lang-val">${lang.level || ''}</span>
                </div>
            `;
        }).join('');

        sidebarHTML += `
            <div class="executive-sidebar-section">
                <h4 class="executive-side-title">Bahasa</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">${langRows}</div>
            </div>
        `;
    }

    sidebarHTML += '</div>';

    // Right Main Body Compilation
    let mainHTML = '<div class="executive-main">';
    
    // Header
    mainHTML += `
        <header class="executive-header">
            <h2 class="executive-name">${personal.name || 'Nama Lengkap Anda'}</h2>
            <div class="executive-title">${personal.title || 'Profesi / Bidang Keahlian'}</div>
        </header>
    `;

    // Summary objective
    if (summary) {
        mainHTML += `
            <section class="executive-section">
                <h3 class="executive-sec-title">Profil Ringkas</h3>
                <div class="executive-summary">${summary}</div>
            </section>
        `;
    }

    // Experience timeline
    if (experience.length > 0) {
        const jobs = experience.map(job => {
            if (!job.role && !job.company) return '';
            return `
                <div class="executive-timeline-item">
                    <div class="executive-item-header">
                        <div>
                            <span class="executive-item-role">${job.role || 'Peran Kerja'}</span>
                            <span style="color: var(--cv-text-muted);"> | </span>
                            <span class="executive-item-comp">${job.company || 'Perusahaan'}</span>
                            ${job.location ? `<span style="font-size: 11px; color: var(--cv-text-muted);"> (${job.location})</span>` : ''}
                        </div>
                        <span class="executive-item-date">${job.date || ''}</span>
                    </div>
                    ${job.desc ? `<div class="executive-item-desc">${job.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="executive-section">
                <h3 class="executive-sec-title">Pengalaman Kerja</h3>
                <div class="executive-timeline-list">${jobs}</div>
            </section>
        `;
    }

    // Education
    if (education.length > 0) {
        const schools = education.map(edu => {
            if (!edu.degree && !edu.school) return '';
            return `
                <div class="executive-timeline-item">
                    <div class="executive-item-header">
                        <div>
                            <span class="executive-item-role">${edu.degree || 'Gelar Akademik'}</span>
                            <span style="color: var(--cv-text-muted);"> | </span>
                            <span class="executive-item-comp">${edu.school || 'Institusi Pendidikan'}</span>
                            ${edu.location ? `<span style="font-size: 11px; color: var(--cv-text-muted);"> (${edu.location})</span>` : ''}
                        </div>
                        <span class="executive-item-date">${edu.date || ''}</span>
                    </div>
                    ${edu.desc ? `<div class="executive-item-desc">${edu.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="executive-section">
                <h3 class="executive-sec-title">Riwayat Pendidikan</h3>
                <div class="executive-timeline-list">${schools}</div>
            </section>
        `;
    }

    // Projects (2 column grid)
    if (projects.length > 0) {
        const projs = projects.map(proj => {
            if (!proj.name) return '';
            const titleHTML = proj.link 
                ? `<a href="${proj.link}" target="_blank">${proj.name} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 8px;"></i></a>` 
                : proj.name;
            return `
                <div class="executive-project-card">
                    <h4 class="executive-proj-title">${titleHTML}</h4>
                    ${proj.role ? `<span style="font-size: 10px; font-weight:700; color: var(--cv-text-muted); text-transform: uppercase;">${proj.role}</span>` : ''}
                    ${proj.desc ? `<p style="font-size: 11px; line-height: 1.4; color: var(--cv-text-color);">${proj.desc}</p>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="executive-section">
                <h3 class="executive-sec-title">Proyek & Portofolio</h3>
                <div class="executive-projects-grid">${projs}</div>
            </section>
        `;
    }

    // Certifications (2 column inline lists)
    if (certifications.length > 0) {
        const certRows = certifications.map(cert => {
            if (!cert.name) return '';
            return `<li class="executive-cert-row"><i class="fa-solid fa-circle-check"></i> ${cert.name}</li>`;
        }).join('');

        mainHTML += `
            <section class="executive-section">
                <h3 class="executive-sec-title">Sertifikasi & Penghargaan</h3>
                <ul class="executive-certs-list">${certRows}</ul>
            </section>
        `;
    }

    mainHTML += '</div>';

    return sidebarHTML + mainHTML;
}

/* ==========================================================================
   TEMPLATE 2: THE ACADEMIC COMPILER (Classic Minimalist)
   ========================================================================== */
function compileAcademic(personal, summary, experience, education, skills, projects, languages, certifications) {
    let html = '';

    // Centered Header
    html += `
        <header class="academic-header">
            <h2 class="academic-name">${personal.name || 'Nama Lengkap Anda'}</h2>
            <div class="academic-title">${personal.title || 'Profesi / Bidang Keahlian'}</div>
            
            <ul class="academic-contact-inline">
    `;
    
    // Compact contacts row
    if (personal.phone) html += `<li>${personal.phone}</li>`;
    if (personal.email) html += `<li><a href="mailto:${personal.email}">${personal.email}</a></li>`;
    if (personal.address) html += `<li>${personal.address}</li>`;
    if (personal.website) {
        const cleanLink = personal.website.replace(/(^\w+:|^)\/\//, '');
        html += `<li><a href="${personal.website}" target="_blank">${cleanLink}</a></li>`;
    }
    if (personal.linkedin) {
        const handle = personal.linkedin.split('/in/')[1] || 'LinkedIn';
        html += `<li><a href="${personal.linkedin}" target="_blank">linkedin.com/in/${handle.replace(/\/$/, '')}</a></li>`;
    }
    if (personal.github) {
        const handle = personal.github.split('github.com/')[1] || 'GitHub';
        html += `<li><a href="${personal.github}" target="_blank">github.com/${handle.replace(/\/$/, '')}</a></li>`;
    }

    html += `
            </ul>
        </header>
    `;

    // Profile summary
    if (summary) {
        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Profil Profesional</h3>
                <p class="academic-summary">${summary}</p>
            </section>
        `;
    }

    // Work Experience
    if (experience.length > 0) {
        const jobs = experience.map(job => {
            if (!job.role && !job.company) return '';
            return `
                <div class="academic-list-item">
                    <div class="academic-item-header">
                        <div>
                            <span class="academic-item-main">${job.role || 'Peran Kerja'}</span>
                            <span class="academic-item-sub">, ${job.company || 'Perusahaan'}</span>
                            ${job.location ? `<span style="font-size: 11px; color: var(--cv-text-muted);"> — ${job.location}</span>` : ''}
                        </div>
                        <span class="academic-item-date">${job.date || ''}</span>
                    </div>
                    ${job.desc ? `<div class="academic-item-desc">${job.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Pengalaman Profesional</h3>
                <div class="academic-list">${jobs}</div>
            </section>
        `;
    }

    // Education
    if (education.length > 0) {
        const schools = education.map(edu => {
            if (!edu.degree && !edu.school) return '';
            return `
                <div class="academic-list-item">
                    <div class="academic-item-header">
                        <div>
                            <span class="academic-item-main">${edu.degree || 'Gelar Akademik'}</span>
                            <span class="academic-item-sub">, ${edu.school || 'Universitas'}</span>
                            ${edu.location ? `<span style="font-size: 11px; color: var(--cv-text-muted);"> — ${edu.location}</span>` : ''}
                        </div>
                        <span class="academic-item-date">${edu.date || ''}</span>
                    </div>
                    ${edu.desc ? `<div class="academic-item-desc">${edu.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Latar Belakang Akademis</h3>
                <div class="academic-list">${schools}</div>
            </section>
        `;
    }

    // Projects
    if (projects.length > 0) {
        const projs = projects.map(proj => {
            if (!proj.name) return '';
            const titleHTML = proj.link 
                ? `<a href="${proj.link}" target="_blank">${proj.name} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 8px;"></i></a>` 
                : proj.name;
            return `
                <div class="academic-proj-row">
                    <div class="academic-proj-header">
                        <h4 class="academic-proj-title">${titleHTML}</h4>
                        ${proj.role ? `<span class="academic-proj-role">${proj.role}</span>` : ''}
                    </div>
                    ${proj.desc ? `<p class="academic-proj-desc">${proj.desc}</p>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Riset & Proyek Terpilih</h3>
                <div class="academic-projects-list">${projs}</div>
            </section>
        `;
    }

    // Skills (comma separated lists)
    if (skills.length > 0 || languages.length > 0) {
        let skillsInline = '';
        if (skills.length > 0) {
            skillsInline += `
                <li>
                    <span class="academic-skill-bold">Keahlian Teknis:</span> 
                    ${skills.map(s => `${s.name} (${s.level >= 80 ? 'Ahli' : s.level >= 50 ? 'Menengah' : 'Dasar'})`).join(', ')}
                </li>
            `;
        }
        if (languages.length > 0) {
            skillsInline += `
                <li>
                    <span class="academic-skill-bold">Penguasaan Bahasa:</span> 
                    ${languages.map(l => `${l.name} (${l.level || 'Dasar'})`).join(', ')}
                </li>
            `;
        }

        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Kompetensi Tambahan</h3>
                <ul class="academic-skills-inline">${skillsInline}</ul>
            </section>
        `;
    }

    // Certifications
    if (certifications.length > 0) {
        const certRows = certifications.map(cert => {
            if (!cert.name) return '';
            return `<div class="academic-cert-item">${cert.name}</div>`;
        }).join('');

        html += `
            <section class="academic-section">
                <h3 class="academic-sec-title">Sertifikasi Profesional</h3>
                <div class="academic-certs-grid">${certRows}</div>
            </section>
        `;
    }

    return html;
}

/* ==========================================================================
   TEMPLATE 3: THE CREATIVE COMPILER (Bold & Graphic)
   ========================================================================== */
function compileCreative(personal, summary, experience, education, skills, projects, languages, certifications) {
    // 1. Creative Banner
    let bannerHTML = `
        <header class="creative-banner">
            <div class="creative-banner-text">
                <h2 class="creative-name">${personal.name || 'Nama Lengkap Anda'}</h2>
                <div class="creative-title">${personal.title || 'Profesi / Bidang Keahlian'}</div>
            </div>
    `;

    if (personal.avatar) {
        bannerHTML += `
            <div class="creative-avatar-wrapper">
                <img class="creative-avatar" src="${personal.avatar}" alt="Avatar">
            </div>
        `;
    }
    
    bannerHTML += '</header>';

    // 2. Creative Body Panels
    let bodyHTML = '<div class="creative-body">';

    // Sidebar panel (light container)
    let sidebarHTML = '<div class="creative-sidebar">';
    
    // Contact list
    const contactRows = [];
    if (personal.phone) contactRows.push(`<li><i class="fa-solid fa-square-phone"></i> ${personal.phone}</li>`);
    if (personal.email) contactRows.push(`<li><i class="fa-solid fa-square-envelope"></i> <a href="mailto:${personal.email}">${personal.email}</a></li>`);
    if (personal.address) contactRows.push(`<li><i class="fa-solid fa-square-parking"></i> ${personal.address}</li>`); // parking used as map square
    if (personal.website) {
        const cleanLink = personal.website.replace(/(^\w+:|^)\/\//, '');
        contactRows.push(`<li><i class="fa-solid fa-square-rss"></i> <a href="${personal.website}" target="_blank">${cleanLink}</a></li>`);
    }
    if (personal.linkedin) {
        const handle = personal.linkedin.split('/in/')[1] || 'LinkedIn';
        contactRows.push(`<li><i class="fa-brands fa-linkedin-in"></i> <a href="${personal.linkedin}" target="_blank">in/${handle.replace(/\/$/, '')}</a></li>`);
    }
    if (personal.github) {
        const handle = personal.github.split('github.com/')[1] || 'GitHub';
        contactRows.push(`<li><i class="fa-brands fa-github-alt"></i> <a href="${personal.github}" target="_blank">@${handle.replace(/\/$/, '')}</a></li>`);
    }

    if (contactRows.length > 0) {
        sidebarHTML += `
            <div class="creative-sidebar-section">
                <h4 class="creative-side-title">Kontak</h4>
                <ul class="creative-contact-list">${contactRows.join('')}</ul>
            </div>
        `;
    }

    // Skills (Rounded pills badges)
    if (skills.length > 0) {
        const pills = skills.map(ski => {
            if (!ski.name) return '';
            return `<li>${ski.name}</li>`;
        }).join('');
        
        sidebarHTML += `
            <div class="creative-sidebar-section">
                <h4 class="creative-side-title">Keahlian Utama</h4>
                <ul class="creative-skills-badges">${pills}</ul>
            </div>
        `;
    }

    // Languages
    if (languages.length > 0) {
        const langRows = languages.map(lang => {
            if (!lang.name) return '';
            return `
                <div class="creative-lang-row">
                    <span class="creative-lang-name">${lang.name}</span>
                    <span class="creative-lang-level">${lang.level || ''}</span>
                </div>
            `;
        }).join('');

        sidebarHTML += `
            <div class="creative-sidebar-section">
                <h4 class="creative-side-title">Bahasa</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">${langRows}</div>
            </div>
        `;
    }

    sidebarHTML += '</div>';

    // Main details panel (white)
    let mainHTML = '<div class="creative-main">';

    // Summary (bordered block quote look)
    if (summary) {
        mainHTML += `
            <section class="creative-section">
                <div class="creative-summary">${summary}</div>
            </section>
        `;
    }

    // Work Experience
    if (experience.length > 0) {
        const jobs = experience.map(job => {
            if (!job.role && !job.company) return '';
            return `
                <div class="creative-timeline-item">
                    <div class="creative-item-header">
                        <div>
                            <span class="creative-item-role">${job.role || 'Peran'}</span>
                            <span style="color: var(--cv-accent-color); font-weight:700;"> @ </span>
                            <span class="creative-item-comp">${job.company || 'Perusahaan'}</span>
                        </div>
                        <span class="creative-item-date">${job.date || ''}</span>
                    </div>
                    ${job.desc ? `<div class="creative-item-desc">${job.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="creative-section">
                <h3 class="creative-sec-title"><i class="fa-solid fa-bolt-lightning"></i> Riwayat Karier</h3>
                <div class="creative-timeline-list">${jobs}</div>
            </section>
        `;
    }

    // Education
    if (education.length > 0) {
        const schools = education.map(edu => {
            if (!edu.degree && !edu.school) return '';
            return `
                <div class="creative-timeline-item">
                    <div class="creative-item-header">
                        <div>
                            <span class="creative-item-role">${edu.degree || 'Studi'}</span>
                            <span style="color: var(--cv-accent-color); font-weight:700;"> @ </span>
                            <span class="creative-item-comp">${edu.school || 'Sekolah'}</span>
                        </div>
                        <span class="creative-item-date">${edu.date || ''}</span>
                    </div>
                    ${edu.desc ? `<div class="creative-item-desc">${edu.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="creative-section">
                <h3 class="creative-sec-title"><i class="fa-solid fa-graduation-cap"></i> Pendidikan</h3>
                <div class="creative-timeline-list">${schools}</div>
            </section>
        `;
    }

    // Projects (Grid layout)
    if (projects.length > 0) {
        const cards = projects.map(proj => {
            if (!proj.name) return '';
            const titleHTML = proj.link 
                ? `<a href="${proj.link}" target="_blank">${proj.name} <i class="fa-solid fa-link" style="font-size: 8px;"></i></a>` 
                : proj.name;
            return `
                <div class="creative-project-card">
                    <h4 class="creative-proj-title">${titleHTML}</h4>
                    ${proj.role ? `<span style="font-size: 10px; font-weight: 700; color: var(--cv-accent-color); text-transform: uppercase;">${proj.role}</span>` : ''}
                    ${proj.desc ? `<p style="font-size: 11px; line-height: 1.4; color: var(--cv-text-color); margin-top:2px;">${proj.desc}</p>` : ''}
                </div>
            `;
        }).join('');

        mainHTML += `
            <section class="creative-section">
                <h3 class="creative-sec-title"><i class="fa-solid fa-cubes"></i> Portofolio & Kreasi</h3>
                <div class="creative-projects-grid">${cards}</div>
            </section>
        `;
    }

    // Certifications
    if (certifications.length > 0) {
        const rows = certifications.map(cert => {
            if (!cert.name) return '';
            return `<li class="creative-cert-row"><i class="fa-regular fa-star"></i> ${cert.name}</li>`;
        }).join('');

        mainHTML += `
            <section class="creative-section">
                <h3 class="creative-sec-title"><i class="fa-solid fa-trophy"></i> Piagam & Lisensi</h3>
                <ul class="creative-certs-list">${rows}</ul>
            </section>
        `;
    }

    mainHTML += '</div>';

    bodyHTML += sidebarHTML + mainHTML + '</div>';

    return bannerHTML + bodyHTML;
}

/* ==========================================================================
   TEMPLATE 4: THE TECH PIONEER COMPILER (Structured Grid)
   ========================================================================== */
function compileTech(personal, summary, experience, education, skills, projects, languages, certifications) {
    let html = '';

    // Technical structured grid header
    html += '<header class="tech-header">';
    
    // Avatar
    if (personal.avatar) {
        html += `<img class="tech-avatar" src="${personal.avatar}" alt="Avatar">`;
    } else {
        // Use placeholder square block code layout
        html += `
            <div style="width: 85px; height: 85px; border: 2px dashed var(--cv-accent-color); display: flex; align-items:center; justify-content:center; border-radius: var(--radius-sm);">
                <i class="fa-solid fa-code" style="font-size: 24px; color: var(--cv-accent-color);"></i>
            </div>
        `;
    }

    // Info panel
    html += `
        <div class="tech-header-info">
            <h2 class="tech-name">${personal.name || 'Nama Lengkap Anda'}</h2>
            <div class="tech-title">${personal.title || 'Profesi / Bidang Keahlian'}</div>
            
            <ul class="tech-contact-grid">
    `;

    if (personal.phone) html += `<li><i class="fa-solid fa-mobile-screen-button"></i> ${personal.phone}</li>`;
    if (personal.email) html += `<li><i class="fa-solid fa-terminal"></i> <a href="mailto:${personal.email}">${personal.email}</a></li>`;
    if (personal.address) html += `<li><i class="fa-solid fa-location-arrow"></i> ${personal.address}</li>`;
    if (personal.website) {
        const cleanLink = personal.website.replace(/(^\w+:|^)\/\//, '');
        html += `<li><i class="fa-solid fa-network-wired"></i> <a href="${personal.website}" target="_blank">${cleanLink}</a></li>`;
    }
    if (personal.linkedin) {
        const handle = personal.linkedin.split('/in/')[1] || 'LinkedIn';
        html += `<li><i class="fa-brands fa-linkedin-in"></i> <a href="${personal.linkedin}" target="_blank">in/${handle.replace(/\/$/, '')}</a></li>`;
    }
    if (personal.github) {
        const handle = personal.github.split('github.com/')[1] || 'GitHub';
        html += `<li><i class="fa-brands fa-github-alt"></i> <a href="${personal.github}" target="_blank">github/${handle.replace(/\/$/, '')}</a></li>`;
    }

    html += `
            </ul>
        </div>
    </header>
    `;

    // 2. High-density Structured lanes
    
    // Profile objective
    if (summary) {
        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Profil</h3>
                </aside>
                <div class="tech-sec-body">
                    <div class="tech-summary">${summary}</div>
                </div>
            </section>
        `;
    }

    // Work Experience
    if (experience.length > 0) {
        const jobs = experience.map(job => {
            if (!job.role && !job.company) return '';
            return `
                <div class="tech-row">
                    <div class="tech-row-header">
                        <div>
                            <span class="tech-row-main">${job.role || 'Role'}</span>
                            <span class="tech-row-sub"> @ ${job.company || 'Comp'}</span>
                        </div>
                        <span class="tech-row-date">${job.date || ''}</span>
                    </div>
                    ${job.desc ? `<div class="tech-row-desc">${job.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Pengalaman</h3>
                </aside>
                <div class="tech-sec-body">${jobs}</div>
            </section>
        `;
    }

    // Education
    if (education.length > 0) {
        const schools = education.map(edu => {
            if (!edu.degree && !edu.school) return '';
            return `
                <div class="tech-row">
                    <div class="tech-row-header">
                        <div>
                            <span class="tech-row-main">${edu.degree || 'Degree'}</span>
                            <span class="tech-row-sub"> @ ${edu.school || 'School'}</span>
                        </div>
                        <span class="tech-row-date">${edu.date || ''}</span>
                    </div>
                    ${edu.desc ? `<div class="tech-row-desc">${edu.desc}</div>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Pendidikan</h3>
                </aside>
                <div class="tech-sec-body">${schools}</div>
            </section>
        `;
    }

    // Technical skills (dense card grids)
    if (skills.length > 0) {
        const cards = skills.map(ski => {
            if (!ski.name) return '';
            let valText = 'MENENGAH';
            if (ski.level >= 85) valText = 'AHLI';
            else if (ski.level <= 45) valText = 'DASAR';
            return `
                <li class="tech-skill-card">
                    <span class="tech-skill-name">${ski.name}</span>
                    <span class="tech-skill-level">${valText}</span>
                </li>
            `;
        }).join('');

        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Keahlian</h3>
                </aside>
                <div class="tech-sec-body">
                    <ul class="tech-skills-grid">${cards}</ul>
                </div>
            </section>
        `;
    }

    // Projects Grid
    if (projects.length > 0) {
        const cards = projects.map(proj => {
            if (!proj.name) return '';
            const titleHTML = proj.link 
                ? `<a href="${proj.link}" target="_blank">${proj.name} <i class="fa-solid fa-code-fork" style="font-size: 8px;"></i></a>` 
                : proj.name;
            return `
                <div class="tech-project-card">
                    <h4 class="tech-proj-title">${titleHTML}</h4>
                    ${proj.role ? `<span style="font-size: 9px; font-weight: 700; color: var(--cv-text-muted); text-transform: uppercase;">${proj.role}</span>` : ''}
                    ${proj.desc ? `<p class="tech-proj-desc">${proj.desc}</p>` : ''}
                </div>
            `;
        }).join('');

        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Proyek</h3>
                </aside>
                <div class="tech-sec-body">
                    <div class="tech-projects-grid">${cards}</div>
                </div>
            </section>
        `;
    }

    // Languages & Certs inside split panels
    let addHTML = '';
    
    if (languages.length > 0) {
        const langRows = languages.map(lang => {
            if (!lang.name) return '';
            return `<div style="font-size:11.5px;"><strong>${lang.name}:</strong> <span style="color:var(--cv-text-muted);">${lang.level || ''}</span></div>`;
        }).join('');

        addHTML += `
            <div style="flex: 1; display:flex; flex-direction:column; gap: 4px;">
                <h4 style="font-size: 11px; font-weight:700; text-transform:uppercase; color: var(--cv-accent-color); border-bottom: 1px solid var(--cv-accent-light); padding-bottom: 2px; margin-bottom: 4px;">Bahasa</h4>
                ${langRows}
            </div>
        `;
    }

    if (certifications.length > 0) {
        const certRows = certifications.map(cert => {
            if (!cert.name) return '';
            return `<li class="tech-cert-row">${cert.name}</li>`;
        }).join('');

        addHTML += `
            <div style="flex: 2; display:flex; flex-direction:column; gap: 4px;">
                <h4 style="font-size: 11px; font-weight:700; text-transform:uppercase; color: var(--cv-accent-color); border-bottom: 1px solid var(--cv-accent-light); padding-bottom: 2px; margin-bottom: 4px;">Sertifikasi</h4>
                <ul class="tech-certs-list" style="grid-template-columns: 1fr;">${certRows}</ul>
            </div>
        `;
    }

    if (addHTML) {
        html += `
            <section class="tech-section">
                <aside class="tech-sec-aside">
                    <h3 class="tech-sec-title">Info Lain</h3>
                </aside>
                <div class="tech-sec-body" style="display:flex; flex-direction:row; gap:20px;">
                    ${addHTML}
                </div>
            </section>
        `;
    }

    return html;
}
