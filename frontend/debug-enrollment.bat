@echo off
echo Testing Module Enrollment Debug Flow...
echo.

echo This test will help us see:
echo 1. If frontend is calling enrollment API
echo 2. If backend is receiving the requests  
echo 3. If enrollments are being created in database
echo.

echo.
echo STEPS:
echo 1. Open your browser and navigate to: http://localhost:5173
echo 2. Login as Syed Hassan
echo 3. Navigate to the "Connect" module
echo 4. Check browser console (F12) for debug messages
echo 5. Check backend console for enrollment requests
echo 6. Run: node test-api-endpoint.js
echo.

echo.
echo EXPECTED RESULTS:
echo - Frontend should show: "🔄 Attempting to enroll user: module-1-connect"
echo - Backend should show: "📝 Enrollment request: {...}"
echo - API test should show: "User Syed Hassan: 🔄 In Progress: 1"
echo.

echo.
echo If you see these messages, the admin dashboard will work!
echo If you see errors, we need to fix them.
echo.
pause
