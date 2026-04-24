#!/usr/bin/env node

// Bundle analysis script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size...\n');

try {
  // Run build with bundle analysis
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Read dist stats
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    console.log('\n📊 Bundle Analysis:');
    console.log(`JavaScript files: ${jsFiles.length}`);
    console.log(`CSS files: ${cssFiles.length}`);
    
    // Calculate total sizes
    let totalJsSize = 0;
    let totalCssSize = 0;
    
    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsPath, file));
      totalJsSize += stats.size;
    });
    
    cssFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsPath, file));
      totalCssSize += stats.size;
    });
    
    console.log(`\nTotal JS size: ${(totalJsSize / 1024).toFixed(2)} KB`);
    console.log(`Total CSS size: ${(totalCssSize / 1024).toFixed(2)} KB`);
    console.log(`Total bundle size: ${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`);
    
    // Find largest files
    const fileSizes = [];
    
    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsPath, file));
      fileSizes.push({ file, size: stats.size, type: 'JS' });
    });
    
    cssFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsPath, file));
      fileSizes.push({ file, size: stats.size, type: 'CSS' });
    });
    
    fileSizes.sort((a, b) => b.size - a.size);
    
    console.log('\n🔝 Largest files:');
    fileSizes.slice(0, 10).forEach(({ file, size, type }) => {
      console.log(`  ${type}: ${file} - ${(size / 1024).toFixed(2)} KB`);
    });
    
    console.log('\n✅ Bundle analysis complete!');
  } else {
    console.log('❌ No assets directory found. Run the build first.');
  }
  
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  process.exit(1);
}
