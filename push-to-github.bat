@echo off
echo Pushing Railway deployment fixes to GitHub...

cd "c:\Users\91827\Desktop\enquiry crm"

echo Checking current status...
git status

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fixed Railway Dockerfile - Using OpenJDK with Maven install"

echo Setting remote origin...
git remote remove origin
git remote add origin https://github.com/mohitkulkarni1999/enquiry-crm.git

echo Pushing to GitHub...
git push -u origin main

echo Done! Check your GitHub repository.
pause
