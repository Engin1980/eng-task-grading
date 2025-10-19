@echo off
setlocal

:: Zeptat se na vstupy
set /p HOST="Zadej hostname/IP: "
set /p PREFIX="Zadej prefix výstupních souborů (https-cert by default): "
set /p PASS="Zadej heslo pro PFX: "

:: Generování privátního klíče
openssl genrsa -out %PREFIX%-%HOST%-key.pem 2048

:: Generování self-signed certifikátu
openssl req -new -x509 -key %PREFIX%-%HOST%-key.pem -out %PREFIX%-%HOST%.pem -days 365 -subj "/CN=%HOST%"

:: Generování PFX souboru
openssl pkcs12 -export -out %PREFIX%-%HOST%.pfx -inkey %PREFIX%-%HOST%-key.pem -in %PREFIX%-%HOST%.pem -passout pass:%PASS%

echo.
echo Hotovo! Vytvořeny soubory PFX: %PREFIX%-%HOST%.pfx, PEM: %PREFIX%-%HOST%.pem, Key: %PREFIX%-%HOST%-key.pem
pause
