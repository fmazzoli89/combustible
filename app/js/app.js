// Global state
let currentUser = '';

// Initialize date/time fields with current date/time
function initializeDateTimeFields() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    document.getElementById('carga-fecha').value = dateString;
    document.getElementById('descarga-fecha').value = dateString;
}

// Fetch and populate all lists
async function loadLists() {
    try {
        const response = await fetch(BASE_API_ENDPOINT);
        if (!response.ok) {
            throw new Error('Failed to fetch lists');
        }
        const data = await response.json();
        
        // Populate obras list
        const obrasSelect = document.getElementById('descarga-obra');
        obrasSelect.innerHTML = '<option value="">Seleccione una obra</option>';
        if (data.obras && Array.isArray(data.obras)) {
            data.obras.forEach(obra => {
                if (obra) {
                    const option = document.createElement('option');
                    option.value = obra;
                    option.textContent = obra;
                    obrasSelect.appendChild(option);
                }
            });
        }

        // Populate operarios list
        const operariosSelect = document.getElementById('descarga-operario');
        operariosSelect.innerHTML = '<option value="">Seleccione un operario</option>';
        if (data.operarios && Array.isArray(data.operarios)) {
            data.operarios.forEach(operario => {
                if (operario) {
                    const option = document.createElement('option');
                    option.value = operario;
                    option.textContent = operario;
                    operariosSelect.appendChild(option);
                }
            });
        }

        // Populate maquinas list
        const maquinasSelect = document.getElementById('descarga-maquina');
        maquinasSelect.innerHTML = '<option value="">Seleccione una máquina</option>';
        if (data.maquinas && Array.isArray(data.maquinas)) {
            data.maquinas.forEach(maquina => {
                if (maquina) {
                    const option = document.createElement('option');
                    option.value = maquina;
                    option.textContent = maquina;
                    maquinasSelect.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error loading lists:', error);
        alert('Error al cargar las listas');
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
    loadLists(); // Load all lists when app starts
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
    
    // Reload lists when switching to descarga tab
    if (tabName === 'descarga') {
        loadLists();
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
        showCustomAlert('Carga Exitosa', () => {
            document.getElementById('carga-form').reset();
            initializeDateTimeFields();
            // Clear number fields explicitly
            document.getElementById('carga-litros').value = '';
        });
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
        const selectedObra = data.obra; // Store the selected obra before reset
        showCustomAlert('Descarga Exitosa', () => {
            document.getElementById('descarga-form').reset();
            document.getElementById('descarga-obra').value = selectedObra; // Restore the obra value
            initializeDateTimeFields();
            // Clear number fields explicitly
            document.getElementById('descarga-litros').value = '';
            document.getElementById('descarga-horometro').value = '';
            document.getElementById('descarga-aceite-motor').value = '';
            document.getElementById('descarga-aceite-hidraulico').value = '';
            document.getElementById('descarga-fluidina').value = '';
        });
    } catch (error) {
        alert('Error al registrar la descarga: ' + error.message);
        console.error('Error:', error);
    }
}

// Custom alert function
function showCustomAlert(message, onClose) {
    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
        z-index: 1000;
    `;

    // Add message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.marginBottom = '20px';
    alertContainer.appendChild(messageElement);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;

    // Function to clean up both elements
    const cleanup = () => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
        if (document.body.contains(alertContainer)) {
            document.body.removeChild(alertContainer);
        }
        if (onClose) onClose();
    };

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.cssText = `
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    closeButton.onclick = cleanup;
    alertContainer.appendChild(closeButton);

    // Add elements to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(alertContainer);

    // Remove both overlay and alert when clicking outside
    overlay.onclick = cleanup;

    // Add keyboard support for closing
    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            cleanup();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Input validation
function setupValidation() {
    const litrosInputs = document.querySelectorAll('input[type="number"]');
    
    litrosInputs.forEach(input => {
        // Clear default value
        input.value = '';
        
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