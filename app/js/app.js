// Global state
let currentUser = '';

// Format date to DD/M/YYYY, HH:mm in GMT-3
function formatDateGMT3(date) {
    // Convert to GMT-3 by adding 3 hours
    const gmt3Date = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    const day = gmt3Date.getDate();
    const month = gmt3Date.getMonth() + 1;
    const year = gmt3Date.getFullYear();
    const hours = gmt3Date.getHours().toString().padStart(2, '0');
    const minutes = gmt3Date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

// Initialize date/time fields with current date/time
function initializeDateTimeFields() {
    const now = new Date();
    // Format the current date and time without any timezone adjustments
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const dateString = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    const cargaFecha = document.getElementById('carga-fecha');
    const descargaFecha = document.getElementById('descarga-fecha');
    
    // Set the values and make them read-only
    cargaFecha.value = dateString;
    descargaFecha.value = dateString;
    
    // Make the fields read-only
    cargaFecha.readOnly = true;
    descargaFecha.readOnly = true;
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

// Load users list for authentication
async function loadUsersList() {
    try {
        const response = await fetch(BASE_API_ENDPOINT);
        if (!response.ok) {
            throw new Error('Failed to fetch users list');
        }
        const data = await response.json();
        
        // Get the select element
        const usersSelect = document.getElementById('user-name');
        if (!usersSelect) {
            throw new Error('Could not find user select element');
        }
        
        // Clear existing options
        usersSelect.innerHTML = '<option value="">Seleccione un usuario</option>';
        
        // Check if we have users data
        if (!data.users || !Array.isArray(data.users)) {
            throw new Error('No se recibió la lista de usuarios del servidor');
        }
        
        // Add user options
        data.users.forEach(username => {
            if (username && typeof username === 'string' && username.trim() !== '') {
                const option = document.createElement('option');
                option.value = username.trim();
                option.textContent = username.trim();
                usersSelect.appendChild(option);
            }
        });
        
        // If no users were added, show error
        if (usersSelect.options.length <= 1) {
            throw new Error('No hay usuarios disponibles');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error al cargar la lista de usuarios: ' + error.message);
    }
}

// Authenticate user
async function authenticateUser(username, password) {
    try {
        const response = await fetch(BASE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            return true;
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Authentication failed');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Check if user is logged in
function checkLoginStatus() {
    try {
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        if (loginData && loginData.username && loginData.expiresAt) {
            // Check if login hasn't expired
            if (new Date().getTime() < loginData.expiresAt) {
                currentUser = loginData.username;
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('main-screen').style.display = 'block';
                document.getElementById('user-display').textContent = currentUser;
                setupLogoutHandler();
                loadLists();
                return true;
            }
        }
        // Clear expired or invalid login data
        localStorage.removeItem('loginData');
    } catch (error) {
        console.error('Error checking login status:', error);
        localStorage.removeItem('loginData');
    }
    return false;
}

// Setup logout handler
function setupLogoutHandler() {
    const userDisplay = document.getElementById('user-display');
    
    // Add cursor pointer style
    userDisplay.style.cursor = 'pointer';
    
    userDisplay.onclick = (event) => {
        // Create logout button if it doesn't exist
        let logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) {
            logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = 'Salir';
            logoutBtn.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                color: red;
                border: 1px solid #ddd;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 1000;
            `;
            
            logoutBtn.onclick = (e) => {
                e.stopPropagation();
                logout();
            };
            
            // Position the container relative for absolute positioning of logout button
            userDisplay.style.position = 'relative';
            userDisplay.appendChild(logoutBtn);
            
            // Close logout button when clicking outside
            const closeLogout = (e) => {
                if (!userDisplay.contains(e.target)) {
                    logoutBtn.remove();
                    document.removeEventListener('click', closeLogout);
                }
            };
            
            // Add delay to avoid immediate trigger of the click event
            setTimeout(() => {
                document.addEventListener('click', closeLogout);
            }, 0);
        } else {
            logoutBtn.remove();
        }
    };
}

// Logout function
function logout() {
    localStorage.removeItem('loginData');
    currentUser = '';
    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('user-display').textContent = '';
    
    // Reset forms
    document.getElementById('carga-form').reset();
    document.getElementById('descarga-form').reset();
    
    // Clear password field
    const passwordInput = document.getElementById('user-password');
    if (passwordInput) {
        passwordInput.value = '';
    }
}

// Start the application
async function startApp() {
    try {
        // Get form elements
        const userNameSelect = document.getElementById('user-name');
        const passwordInput = document.getElementById('user-password');
        
        if (!userNameSelect || !passwordInput) {
            throw new Error('No se encontraron los campos de autenticación');
        }
        
        // Get values
        const username = userNameSelect.value;
        const password = passwordInput.value;
        
        // Validate inputs
        if (!username) {
            throw new Error('Por favor seleccione un usuario');
        }
        
        if (!password) {
            throw new Error('Por favor ingrese la contraseña');
        }
        
        // Store login data with 90-day expiration
        const expiresAt = new Date().getTime() + (90 * 24 * 60 * 60 * 1000); // 90 days in milliseconds
        localStorage.setItem('loginData', JSON.stringify({
            username,
            expiresAt
        }));
        
        // Store username and show main content
        currentUser = username;
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        document.getElementById('user-display').textContent = username;
        
        // Setup logout handler
        setupLogoutHandler();
        
        // Load initial data
        await loadLists();
        
    } catch (error) {
        console.error('Authentication error:', error);
        if (passwordInput) {
            passwordInput.value = '';
        }
        alert(error.message || 'Error de autenticación');
    }
}

// Show selected tab
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
    
    // Reload lists when switching to descarga tab
    if (tabName === 'descarga') {
        loadLists();
    }
}

// Handle carga form submission
async function handleCarga(event) {
    event.preventDefault();
    
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
    
    const data = {
        estacion: document.getElementById('carga-estacion').value,
        litros: document.getElementById('carga-litros').value,
        usuario: currentUser,
        tipo: 'CARGA'
    };
    
    try {
        const values = [
            formattedDate,
            data.tipo,
            data.estacion,
            data.litros,
            data.usuario
        ];
        
        await appendToSheet(values);
        showCustomAlert('Carga Exitosa', () => {
            document.getElementById('carga-form').reset();
            // Clear number fields explicitly
            document.getElementById('carga-litros').value = '';
        });
    } catch (error) {
        alert('Error al registrar la carga: ' + error.message);
        console.error('Error:', error);
    }
}

// Get GPS location
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no está soportada en este dispositivo'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = `${position.coords.latitude},${position.coords.longitude}`;
                resolve(location);
            },
            (error) => {
                console.error('Error getting location:', error);
                reject(new Error('No se pudo obtener la ubicación. Por favor habilite el GPS.'));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Handle descarga form submission
async function handleDescarga(event) {
    event.preventDefault();
    
    try {
        // Get GPS location first
        const location = await getLocation();
        
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
        
        const data = {
            obra: document.getElementById('descarga-obra').value,
            maquina: document.getElementById('descarga-maquina').value,
            operario: document.getElementById('descarga-operario').value,
            litros: document.getElementById('descarga-litros').value,
            horometro: document.getElementById('descarga-horometro').value,
            aceiteMotor: document.getElementById('descarga-aceite-motor').value,
            aceiteHidraulico: document.getElementById('descarga-aceite-hidraulico').value,
            fluidina: document.getElementById('descarga-fluidina').value,
            usuario: currentUser,
            tipo: 'DESCARGA',
            ubicacion: location
        };
        
        const values = [
            formattedDate,
            data.tipo,
            data.obra,
            data.maquina,
            data.operario,
            data.litros,
            data.horometro,
            data.aceiteMotor,
            data.aceiteHidraulico,
            data.fluidina,
            data.usuario,
            data.ubicacion // Add location to the values array
        ];
        
        await appendToSheet(values);
        const selectedObra = data.obra; // Store the selected obra before reset
        showCustomAlert('Descarga Exitosa', () => {
            document.getElementById('descarga-form').reset();
            document.getElementById('descarga-obra').value = selectedObra; // Restore the obra value
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

// Show history modal
async function showHistorial() {
    try {
        const currentTab = document.querySelector('.tab-btn.active').textContent;
        const sheetName = currentTab === 'CARGA' ? 'Cargas' : 'Descargas';
        
        const response = await fetch(BASE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser,
                sheetName: sheetName
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        const historialList = document.getElementById('historial-list');
        const historialTitle = document.getElementById('historial-title');
        
        // Update title
        historialTitle.textContent = `Historial de ${sheetName}`;
        
        // Clear previous entries
        historialList.innerHTML = '';
        
        // Add new entries
        data.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            // Use the date string directly from the sheet since it's already in the correct format
            const dateStr = entry[0];
            
            if (sheetName === 'Cargas') {
                item.textContent = `${dateStr} - ${entry[2]} - ${entry[3]} litros`;
            } else {
                item.textContent = `${dateStr} - ${entry[2]} - ${entry[3]} - ${entry[5]} litros`;
            }
            
            historialList.appendChild(item);
        });
        
        // Show modal
        document.getElementById('historial-modal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching history:', error);
        alert('Error al cargar el historial');
    }
}

// Close history modal
function closeHistorial() {
    document.getElementById('historial-modal').style.display = 'none';
}

// Add keyboard support for closing modal
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeHistorial();
    }
});

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const modal = document.getElementById('historial-modal');
    if (event.target === modal) {
        closeHistorial();
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (!checkLoginStatus()) {
        // If not logged in, load users list
        loadUsersList();
    }
    setupValidation();
}); 