// Initialize date-time fields with current date and time
function initializeDateTimeFields() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    document.getElementById('cargaFecha').value = dateString;
    document.getElementById('descargaFecha').value = dateString;
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
        // Here we'll add Google Sheets integration later
        console.log('Carga data:', data);
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
        // Here we'll add Google Sheets integration later
        console.log('Descarga data:', data);
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