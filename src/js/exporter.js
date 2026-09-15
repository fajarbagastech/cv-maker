/* 
   CV Vibe - PDF and Print Export Engine
   Manages html2pdf.js configurations (A4 margins, high-DPI scale rendering) 
   and native browser vector printing triggers.
*/

export class CVExporter {
    /**
     * @param {CVStore} store 
     */
    constructor(store) {
        this.store = store;
        this.initDOMElements();
        this.bindEvents();
    }

    initDOMElements() {
        this.btnPrint = document.getElementById('btn-print');
        this.btnDownloadPDF = document.getElementById('btn-download-pdf');
        this.cvPage = document.getElementById('cv-preview-document');
    }

    bindEvents() {
        // Direct print dialog
        this.btnPrint.addEventListener('click', () => {
            window.print();
        });

        // Crisp PDF compiler download
        this.btnDownloadPDF.addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    /**
     * Execute high-fidelity canvas scale-up and export PDF
     */
    exportToPDF() {
        const state = this.store.getState();
        const personalName = state.personal.name || 'Resume';
        const cleanFilename = `${personalName.replace(/\s+/g, '_')}_CV.pdf`;

        // Premium visual feedback button loading state
        const originalText = this.btnDownloadPDF.innerHTML;
        this.btnDownloadPDF.disabled = true;
        this.btnDownloadPDF.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Rendering PDF...';

        // Precision configurations for html2pdf
        const opt = {
            margin:       0,
            filename:     cleanFilename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2.5,               // High scaling for crisp text on print
                useCORS: true,            // Prevents tainted canvas errors for external avatars
                letterRendering: true,    // Matches typography kerning perfectly
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF:        { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            },
            pagebreak:    { 
                mode: ['css', 'legacy']   // Honors section pagebreaks neatly
            }
        };

        // Render PDF directly using html2pdf CDN package
        html2pdf().set(opt).from(this.cvPage).save()
            .then(() => {
                // Restore button state
                this.btnDownloadPDF.disabled = false;
                this.btnDownloadPDF.innerHTML = originalText;
            })
            .catch((err) => {
                console.error('PDF Generation Failure:', err);
                alert('Gagal mengekspor PDF. Pastikan browser Anda memiliki koneksi internet untuk memuat renderer.');
                this.btnDownloadPDF.disabled = false;
                this.btnDownloadPDF.innerHTML = originalText;
            });
    }
}
