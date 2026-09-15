/* 
   CV Vibe - Main Orchestrator Module
   Integrates Store, UI, Exporter, and Renderer.
   Manages initial boot sequence and schedules real-time rendering.
*/

import { CVStore } from './store.js';
import { CVUI } from './ui.js';
import { renderCV } from './renderer.js';
import { CVExporter } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Engines
    const store = new CVStore();
    const ui = new CVUI(store);
    const exporter = new CVExporter(store);

    // 2. State update subscription
    store.subscribe((state, fullSync) => {
        // Real-time render preview CV on every keystroke
        renderCV(ui.cvPage, state);
        
        // Dynamic full rebuild of accordion lists ONLY when triggered via setState
        if (fullSync) {
            ui.syncFormValues(state);
        }
    });

    // 3. Smart Onboarding Check:
    // If the local storage is completely empty (new user), load sample data automatically
    // so they see a premium pre-filled resume instead of blank dread.
    const currentState = store.getState();
    const isStateEmpty = !currentState.personal.name && 
                         currentState.experience.length === 0 && 
                         currentState.education.length === 0;
                         
    if (isStateEmpty) {
        // Automatically populates, which triggers the subscription to render and sync UI
        store.loadSampleData();
    } else {
        // Sync existing loaded user data to editor form inputs and compile the A4 document
        ui.syncFormValues(currentState);
        renderCV(ui.cvPage, currentState);
    }

    console.log('CV Vibe successfully booted and listening for sync inputs.');
});
