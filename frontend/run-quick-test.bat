@echo off
echo Testing MongoDB Connection and Admin Dashboard Data...
echo.

REM Run simple connection test
node simple-connection-test.mjs

echo.
echo If you see "Connected to MongoDB successfully" above,
echo your database connection is working.
echo.
echo If you see enrollment data, the admin dashboard
echo should display it correctly.
echo.
pause
