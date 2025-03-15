// Global state
let currentUser = '';

// Initialize date/time fields with current date/time
function initializeDateTimeFields() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    document.getElementById('carga-fecha').value = dateString;
    document.getElementById('descarga-fecha').value = dateString;
}

// Fetch and populate obras list
async function loadObrasList() {
    try {
        const response = await fetch(BASE_API_ENDPOINT);
        if (!response.ok) {
            throw new Error('Failed to fetch obras list');
        }
        const data = await response.json();
        
        // Get the select element
        const obrasSelect = document.getElementById('descarga-obra');
        
        // Clear existing options
        obrasSelect.innerHTML = '<option value="">Seleccione una obra</option>';
        
        // Add new options
        if (data.obras && Array.isArray(data.obras)) {
            data.obras.forEach(obra => {
                if (obra) { // Only add non-empty obras
                    const option = document.createElement('option');
                    option.value = obra;
                    option.textContent = obra;
                    obrasSelect.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error loading obras:', error);
        alert('Error al cargar la lista de obras');
    }
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
    loadObrasList(); // Load obras when app starts
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
    
    // Reload obras list when switching to descarga tab
    if (tabName === 'descarga') {
        loadObrasList();
    }
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
        const values = [
            new Date(data.fecha).toLocaleString(),
            data.tipo,
            data.estacion,
            data.litros,
            data.usuario
        ];
        
        await appendToSheet(values);
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
        const values = [
            new Date(data.fecha).toLocaleString(),
            data.tipo,
            data.obra,
            data.maquina,
            data.operario,
            data.litros,
            data.horometro,
            data.aceiteMotor,
            data.aceiteHidraulico,
            data.fluidina,
            data.usuario
        ];
        
        await appendToSheet(values);
        alert('Descarga registrada exitosamente');
        document.getElementById('descarga-form').reset();
        initializeDateTimeFields();
    } catch (error) {
        alert('Error al registrar la descarga: ' + error.message);
        console.error('Error:', error);
    }
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