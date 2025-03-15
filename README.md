# Gestión de Combustible - Aplicación Web Móvil

Una aplicación web simple para gestionar la carga y descarga de combustible y otros fluidos en obras de construcción.

## Características

- Registro de cargas de combustible
  - Fecha y hora
  - Estación de servicio
  - Cantidad de litros (máx. 700)

- Registro de descargas de combustible
  - Fecha y hora
  - Obra
  - Máquina
  - Operario
  - Cantidad de litros (máx. 400)
  - Horómetro
  - Aceites y fluidos adicionales

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- Google Sheets API (próximamente)

## Instalación

1. Clona este repositorio
2. Abre el archivo `app/index.html` en tu navegador

## Uso

1. Selecciona la pestaña "CARGA" o "DESCARGA" según la operación que desees realizar
2. Completa los campos requeridos
3. Presiona el botón correspondiente para registrar la operación

## Próximas Mejoras

- Integración con Google Sheets para almacenamiento de datos
- Autenticación de usuarios
- Listas dinámicas de obras, máquinas y operarios
- Validaciones adicionales
- Generación de reportes

## Licencia

MIT 

# Combustible App

A simple web application for tracking fuel usage.

## Project Structure

- `app/`: Contains the frontend static files
- `api/`: Contains the serverless API functions

## API Endpoints

- `/api`: Root API endpoint
- `/api/hello`: Simple hello world endpoint
- `/api/env-check`: Checks environment variables
- `/api/sheets-test`: Tests Google Sheets connection
- `/api/sheets`: Endpoint for adding data to Google Sheets

## Deployment

This project is designed to be deployed to Vercel. To deploy:

1. Push the code to a GitHub repository
2. Connect the repository to Vercel
3. Set the following environment variables in Vercel:
   - `SHEET_ID`: Your Google Sheet ID
   - `CLIENT_EMAIL`: The service account email from your Google API credentials
   - `PRIVATE_KEY`: The private key from your Google API credentials

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Troubleshooting

If you encounter issues with the API endpoints, check the following:

1. Make sure the environment variables are correctly set in Vercel
2. Check the Vercel deployment logs for any errors
3. Use the `/api/env-check` endpoint to verify environment variables
4. Use the test pages in the `app/` directory to test the API endpoints 