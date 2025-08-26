@echo off
echo Building React client...
cd client
call npm install
call npm run build
cd ..
echo Build complete!
