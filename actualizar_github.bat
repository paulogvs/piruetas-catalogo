@echo off
echo ========================================
echo   ACTUALIZANDO PIRUETAS CON ESTILO
echo ========================================
echo.

:: Configuración del Repositorio
set REPO_URL=https://github.com/paulogvs/piruetas-catalogo.git

:: Verificar si Git está inicializado
if not exist .git (
    echo [!] Inicializando Git...
    git init
)

:: Asegurar que el remote esté bien configurado
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

:: Agregar todos los cambios
echo [+] Preparando archivos...
git add .

:: Pedir comentario del commit
set /p commit_msg="Introduce el mensaje del cambio (ej: mejoras de UI): "
if "%commit_msg%"=="" set commit_msg="Actualizacion dinamica"

:: Hacer commit
echo.
echo [+] Guardando cambios localmente...
git commit -m "%commit_msg%"

:: Push a GitHub
echo.
echo [+] Subiendo a GitHub...
git push -u origin main

echo.
echo ========================================
echo   ¡PROYECTO ACTUALIZADO CON EXITO!
echo ========================================
pause
