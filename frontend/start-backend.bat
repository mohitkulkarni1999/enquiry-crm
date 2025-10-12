@echo off
echo Starting Enquiry CRM Backend...
cd backend
mvn -q -DskipTests spring-boot:run
pause
