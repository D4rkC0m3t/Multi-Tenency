import { readdir, readFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build']);
const FILE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

// Patterns to search for
const PATTERNS = {
  createClient: /createClient\s*\(\s*['"`]([^'"`]+)['"`]/g,
  supabaseUrl: /(?:const|let|var)\s+(?:\w+\s*,\s*)?(\w*[sS]upabaseUrl\w*)\s*=/g,
  supabase: /(?:const|let|var)\s+(\w*[sS]upabase\w*)\s*=/g,
  importMeta: /import\.meta\.env/g,
};

async function* walkDir(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      if (!EXCLUDE_DIRS.has(file.name)) {
        yield* walkDir(filePath);
      }
    } else if (FILE_EXTENSIONS.has(path.extname(file.name).toLowerCase())) {
      yield filePath;
    }
  }
}

async function auditFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    let hasIssues = false;
    let output = [];

    // Check for hardcoded dashboard URLs
    if (content.includes('supabase.com/dashboard')) {
      output.push('❌ Found hardcoded dashboard URL');
      hasIssues = true;
    }

    // Check for createClient calls
    const createClientMatches = [...content.matchAll(PATTERNS.createClient)];
    if (createClientMatches.length > 0) {
      output.push(`ℹ️ Found ${createClientMatches.length} createClient call(s)`);
      
      createClientMatches.forEach((match, i) => {
        const url = match[1];
        if (url.includes('supabase.com/dashboard')) {
          output.push(`❌ createClient #${i+1}: Hardcoded dashboard URL detected`);
          hasIssues = true;
        } else if (!url.includes('import.meta.env')) {
          output.push(`⚠️  createClient #${i+1}: Hardcoded URL detected (${url.length > 30 ? url.slice(0, 30) + '...' : url})`);
          hasIssues = true;
        }
      });
    }

    // Check for direct supabaseUrl assignments
    const supabaseUrlMatches = [...content.matchAll(PATTERNS.supabaseUrl)];
    if (supabaseUrlMatches.length > 0) {
      supabaseUrlMatches.forEach(match => {
        const varName = match[1];
        const varAssignRegex = new RegExp(`(const|let|var)\s+${varName}\s*=\s*([^;]+);`);
        const assignMatch = content.match(varAssignRegex);
        
        if (assignMatch) {
          const value = assignMatch[2].trim();
          if (value.includes('supabase.com/dashboard')) {
            output.push(`❌ ${varName}: Hardcoded dashboard URL detected`);
            hasIssues = true;
          } else if (!value.includes('import.meta.env') && !value.includes('process.env')) {
            output.push(`⚠️  ${varName}: Hardcoded value detected (${value.length > 30 ? value.slice(0, 30) + '...' : value})`);
            hasIssues = true;
          }
        }
      });
    }

    // Check for multiple supabase client instances
    const supabaseVarMatches = [...content.matchAll(PATTERNS.supabase)];
    if (supabaseVarMatches.length > 1) {
      output.push(`⚠️  Found ${supabaseVarMatches.length} potential Supabase client variables`);
      hasIssues = true;
    }

    // Check for environment variable usage
    if (!content.includes('import.meta.env') && !content.includes('process.env')) {
      output.push('ℹ️ No environment variable usage detected');
    }

    if (hasIssues || output.length > 0) {
      console.log(`\n📄 ${relativePath}`);
      console.log(output.join('\n  '));
      return true;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
  return false;
}

async function main() {
  console.log('🔍 Auditing Supabase client initializations...\n');
  
  let issueCount = 0;
  const startTime = Date.now();
  
  for await (const filePath of walkDir(ROOT_DIR)) {
    const hasIssues = await auditFile(filePath);
    if (hasIssues) issueCount++;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Audit completed in ${duration}s`);
  console.log(`📊 ${issueCount} file(s) with potential issues found`);
  
  if (issueCount > 0) {
    console.log('\n🔧 Recommendation: Create a single supabase client instance in src/lib/supabase.ts and import it throughout your app.');
    console.log('   Example: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs');
  }
}

main().catch(console.error);
