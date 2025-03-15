// Google Sheets configuration
const SHEET_ID = '1hUZfOdDwG44M5k2-dI0NXpH8248LAcwlBde9emw2GP8';
const SHEET_NAME_CARGA = 'Cargas';
const SHEET_NAME_DESCARGA = 'Descargas';
const API_KEY = 'AIzaSyA9DajDlIlCLytHNPCkrCCfVUx5yQRohxI';

// Initialize date-time fields with current date and time
function initializeDateTimeFields() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    document.getElementById('cargaFecha').value = dateString;
    document.getElementById('descargaFecha').value = dateString;
}

// Helper function to split datetime into date and time
function splitDateTime(dateTimeStr) {
    const dt = new Date(dateTimeStr);
    const date = dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return [date, time];
}

// Tab switching functionality
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show selected content
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
}

// Google Sheets API functions
async function appendToSheet(sheetName, values) {
    try {
        // Use our serverless function instead of directly calling Google Sheets API
        const response = await fetch('/api/sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheetName,
                values
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('API Error:', result);
            throw new Error(result.error?.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log('Success:', result);
        return result;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
}

// Form submission handlers
function setupForms() {
    const cargaForm = document.getElementById('cargaForm');
    const descargaForm = document.getElementById('descargaForm');

    cargaForm.addEventListener('submit', handleCargaSubmit);
    descargaForm.addEventListener('submit', handleDescargaSubmit);
}

async function handleCargaSubmit(event) {
    event.preventDefault();
    
    const data = {
        fecha: document.getElementById('cargaFecha').value,
        estacion: document.getElementById('estacion').value,
        litros: document.getElementById('cargaLitros').value
    };

    try {
        const [date, time] = splitDateTime(data.fecha);
        const values = [
            date,                   // Fecha
            time,                   // Hora
            data.estacion,          // Estación
            data.litros             // Litros
        ];

        await appendToSheet(SHEET_NAME_CARGA, values);
        alert('Carga registrada exitosamente');
        event.target.reset();
        initializeDateTimeFields();
    } catch (error) {
        console.error('Error al registrar carga:', error);
        alert('Error al registrar la carga');
    }
}

async function handleDescargaSubmit(event) {
    event.preventDefault();
    
    const data = {
        fecha: document.getElementById('descargaFecha').value,
        obra: document.getElementById('obra').value,
        maquina: document.getElementById('maquina').value,
        operario: document.getElementById('operario').value,
        litros: document.getElementById('descargaLitros').value,
        horometro: document.getElementById('horometro').value,
        aceiteMotor: document.getElementById('aceiteMotor').value,
        aceiteHidraulico: document.getElementById('aceiteHidraulico').value,
        fluidina: document.getElementById('fluidina').value
    };

    try {
        const [date, time] = splitDateTime(data.fecha);
        const values = [
            date,                   // Fecha
            time,                   // Hora
            data.obra,              // Obra
            data.maquina,           // Máquina
            data.operario,          // Operario
            data.litros,            // Litros
            data.horometro,         // Horómetro
            data.aceiteMotor,       // Aceite de motor
            data.aceiteHidraulico,  // Aceite hidráulico
            data.fluidina           // Fluidina
        ];

        await appendToSheet(SHEET_NAME_DESCARGA, values);
        alert('Descarga registrada exitosamente');
        event.target.reset();
        initializeDateTimeFields();
    } catch (error) {
        console.error('Error al registrar descarga:', error);
        alert('Error al registrar la descarga');
    }
}

// Input validation
function setupValidation() {
    const litrosInputs = document.querySelectorAll('input[type="number"]');
    
    litrosInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            if (input.id === 'cargaLitros' && value > 700) {
                input.value = 700;
            } else if (input.id === 'descargaLitros' && value > 400) {
                input.value = 400;
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDateTimeFields();
    setupTabs();
    setupForms();
    setupValidation();
}); 