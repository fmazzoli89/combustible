// Global state
let currentUser = '';

// Initialize date/time fields with current date/time
function initializeDateTimeFields() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    document.getElementById('carga-fecha').value = dateString;
    document.getElementById('descarga-fecha').value = dateString;
}

// Start the application after user enters their name
function startApp() {
    const userNameInput = document.getElementById('user-name');
    const userName = userNameInput.value.trim();
    
    if (!userName) {
        alert('Por favor ingrese su nombre/identificador');
        return;
    }
    
    currentUser = userName;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    initializeDateTimeFields();
}

// Show selected tab
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// Handle carga form submission
async function handleCarga(event) {
    event.preventDefault();
    
    const data = {
        fecha: document.getElementById('carga-fecha').value,
        estacion: document.getElementById('carga-estacion').value,
        litros: document.getElementById('carga-litros').value,
        usuario: currentUser,
        tipo: 'CARGA'
    };
    
    try {
        await sendToGoogleSheets(data);
        alert('Carga registrada exitosamente');
        document.getElementById('carga-form').reset();
        initializeDateTimeFields();
    } catch (error) {
        alert('Error al registrar la carga: ' + error.message);
        console.error('Error:', error);
    }
}

// Handle descarga form submission
async function handleDescarga(event) {
    event.preventDefault();
    
    const data = {
        fecha: document.getElementById('descarga-fecha').value,
        obra: document.getElementById('descarga-obra').value,
        maquina: document.getElementById('descarga-maquina').value,
        operario: document.getElementById('descarga-operario').value,
        litros: document.getElementById('descarga-litros').value,
        horometro: document.getElementById('descarga-horometro').value,
        aceiteMotor: document.getElementById('descarga-aceite-motor').value,
        aceiteHidraulico: document.getElementById('descarga-aceite-hidraulico').value,
        fluidina: document.getElementById('descarga-fluidina').value,
        usuario: currentUser,
        tipo: 'DESCARGA'
    };
    
    try {
        await sendToGoogleSheets(data);
        alert('Descarga registrada exitosamente');
        document.getElementById('descarga-form').reset();
        initializeDateTimeFields();
    } catch (error) {
        alert('Error al registrar la descarga: ' + error.message);
        console.error('Error:', error);
    }
}

// Send data to Google Sheets
async function sendToGoogleSheets(data) {
    if (!SHEET_ID || !API_KEY) {
        throw new Error('Configuración de Google Sheets no encontrada');
    }
    
    const values = data.tipo === 'CARGA' 
        ? [[
            new Date(data.fecha).toLocaleString(),
            data.tipo,
            data.estacion,
            data.litros,
            '',
            '',
            '',
            '',
            '',
            data.usuario
        ]]
        : [[
            new Date(data.fecha).toLocaleString(),
            data.tipo,
            data.obra,
            data.litros,
            data.maquina,
            data.operario,
            data.horometro,
            data.aceiteMotor,
            data.aceiteHidraulico,
            data.fluidina,
            data.usuario
        ]];

    const response = await fetch(ENDPOINTS.APPEND, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: values
        })
    });

    if (!response.ok) {
        throw new Error('Error al enviar datos a Google Sheets');
    }

    return response.json();
}

// Input validation
function setupValidation() {
    const litrosInputs = document.querySelectorAll('input[type="number"]');
    
    litrosInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            if (input.id === 'carga-litros' && value > 700) {
                input.value = 700;
            } else if (input.id === 'descarga-litros' && value > 400) {
                input.value = 400;
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date/time fields if user is already authenticated
    if (document.getElementById('main-screen').style.display !== 'none') {
        initializeDateTimeFields();
    }
    setupValidation();
}); 