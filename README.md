# Control de Combustible

Una aplicación web simple para registrar cargas y descargas de combustible.

## Descripción

Esta aplicación permite registrar:
- Cargas de combustible (desde estaciones de servicio)
- Descargas de combustible (a máquinas)
- Registro de aceites y fluidos

## Configuración

1. Crear una hoja de Google Sheets
2. Configurar Google Cloud Project:
   - Crear un nuevo proyecto en Google Cloud Console
   - Habilitar Google Sheets API
   - Crear credenciales (API Key) con acceso a Google Sheets API
3. Configurar la aplicación:
   - Abrir `js/config.js`
   - Agregar el ID de la hoja de Google (el string largo en la URL entre /d/ y /edit)
   - Agregar la API Key generada

## Deployment en Vercel

1. Instalar Vercel CLI (opcional):
```bash
npm i -g vercel
```

2. Deployar a Vercel:
   - **Opción 1 - GitHub:**
     1. Subir el código a un repositorio de GitHub
     2. Importar el proyecto en [Vercel](https://vercel.com/import)
     3. Seleccionar el repositorio
     4. Vercel detectará automáticamente la configuración

   - **Opción 2 - Vercel CLI:**
     ```bash
     vercel
     ```

3. La aplicación estará disponible en un dominio `.vercel.app`

## Uso Local

1. Navegar al directorio de la aplicación:
```bash
cd app
```

2. Iniciar un servidor local:
```bash
python3 -m http.server 8000
```

3. Abrir en el navegador:
```
http://localhost:8000
```

## Estructura de la Aplicación

```
app/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos
└── js/
    ├── app.js         # Lógica principal
    └── config.js      # Configuración de Google Sheets
```

## Seguridad

- No compartir la API Key
- Configurar restricciones apropiadas en Google Cloud Console
- Limitar el acceso a la hoja de Google Sheets
- En producción, configurar CORS y restricciones de dominio para la API Key

## Soporte

Para problemas o preguntas:
1. Verificar la configuración en `config.js`
2. Revisar la consola del navegador para errores
3. Verificar el acceso a la hoja de Google Sheets
4. Verificar los logs de deployment en Vercel 