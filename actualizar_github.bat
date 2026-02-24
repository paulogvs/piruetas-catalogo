@echo off
echo ========================================
echo   ACTUALIZANDO PIRUETAS CON ESTILO
echo ========================================
echo.

:: Verificar si Git está inicializado
if not exist .git (
    echo [!] Inicializando Git...
    git init
    git branch -M main
    echo.
)

:: Agregar todos los cambios
echo [+] Preparando archivos...
git add .

:: Pedir comentario del commit
set /p commit_msg="Introduce el mensaje del cambio (ej: mejoras de UI): "
if "%commit_msg%"=="" set commit_msg="Actualización dinámica"

:: Hacer commit
echo.
echo [+] Guardando cambios localmente...
git commit -m "%commit_msg%"

:: Push a GitHub
echo.
echo [+] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo   ¡PROYECTO ACTUALIZADO CON ÉXITO!
echo ========================================
pause
