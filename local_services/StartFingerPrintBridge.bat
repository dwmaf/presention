@echo off
cd /d "C:\laragon\www\presention\local_services"
start FingerprintBridge.exe

cd /d "C:\laragon\www\presention"

:: Start Laravel Web Server di background log minimal
start "Presention Web Server" php artisan serve --host=0.0.0.0 --port=8000
exit