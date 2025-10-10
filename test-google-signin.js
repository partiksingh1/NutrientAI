#!/usr/bin/env node

/**
 * Test script to verify Google Sign-In setup
 * Run with: node test-google-signin.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Google Sign-In Setup...\n');

// Check if required files exist
const requiredFiles = [
  'server/src/auth/better-auth.ts',
  'server/src/routes/better-auth.routes.ts',
  'expo-starter-auth-nativewind/lib/better-auth.ts',
  'expo-starter-auth-nativewind/components/GoogleSignInButton.tsx',
  'expo-starter-auth-nativewind/services/authService.ts',
  'expo-starter-auth-nativewind/context/AuthContext.tsx',
  'server/prisma/schema.prisma'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment files
console.log('\n🔧 Checking environment files...');
const envFiles = [
  'server/.env',
  'expo-starter-auth-nativewind/.env'
];

envFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    
    // Check for required environment variables
    const content = fs.readFileSync(filePath, 'utf8');
    if (file.includes('server')) {
      const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'BETTER_AUTH_SECRET'];
      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          console.log(`  ✅ ${varName} is defined`);
        } else {
          console.log(`  ❌ ${varName} is missing`);
        }
      });
    } else {
      const requiredVars = ['EXPO_PUBLIC_GOOGLE_CLIENT_ID', 'EXPO_PUBLIC_API_URL'];
      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          console.log(`  ✅ ${varName} is defined`);
        } else {
          console.log(`  ❌ ${varName} is missing`);
        }
      });
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');

// Check server dependencies
const serverPackagePath = path.join(__dirname, 'server/package.json');
if (fs.existsSync(serverPackagePath)) {
  const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
  const requiredDeps = ['better-auth'];
  requiredDeps.forEach(dep => {
    if (serverPackage.dependencies && serverPackage.dependencies[dep]) {
      console.log(`✅ Server: ${dep}@${serverPackage.dependencies[dep]}`);
    } else {
      console.log(`❌ Server: ${dep} - MISSING`);
    }
  });
}

// Check frontend dependencies
const frontendPackagePath = path.join(__dirname, 'expo-starter-auth-nativewind/package.json');
if (fs.existsSync(frontendPackagePath)) {
  const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  const requiredDeps = ['better-auth', 'expo-auth-session', 'expo-crypto'];
  requiredDeps.forEach(dep => {
    if (frontendPackage.dependencies && frontendPackage.dependencies[dep]) {
      console.log(`✅ Frontend: ${dep}@${frontendPackage.dependencies[dep]}`);
    } else {
      console.log(`❌ Frontend: ${dep} - MISSING`);
    }
  });
}

console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ Google Sign-In implementation is complete');
  console.log('\n🚀 Next steps:');
  console.log('1. Set up your Google Cloud Console project');
  console.log('2. Update environment variables with your Google OAuth credentials');
  console.log('3. Run database migrations: cd server && npx prisma db push');
  console.log('4. Start the backend: cd server && npm run dev');
  console.log('5. Start the frontend: cd expo-starter-auth-nativewind && npm start');
  console.log('6. Test the Google Sign-In flow in your app');
} else {
  console.log('❌ Some files are missing. Please check the implementation.');
}

console.log('\n📖 For detailed setup instructions, see GOOGLE_SIGNIN_SETUP.md');