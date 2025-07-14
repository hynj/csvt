import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { copyDirectory, directoryExists, getCurrentDate } from './utils.ts'
import type { ProjectInfo } from './prompts.ts'

export async function createProject(projectInfo: ProjectInfo): Promise<void> {
  const { projectName } = projectInfo
  
  // Check if directory already exists
  if (await directoryExists(projectName)) {
    throw new Error(`Directory "${projectName}" already exists`)
  }

  console.log(`📁 Creating project directory: ${projectName}`)
  await mkdir(projectName, { recursive: true })

  // Find templates directory relative to this script
  const scriptDir = dirname(new URL(import.meta.url).pathname)
  const projectRoot = join(scriptDir, '../')
  const templateDir = join(projectRoot, `templates/${projectInfo.template}`)
  
  console.log('📄 Copying template files...')
  await copyTemplateFiles(templateDir, projectName, projectInfo)

  if (projectInfo.initGit) {
    console.log('📦 Initializing git repository...')
    await initGitRepo(projectName)
  }

  if (projectInfo.installDeps) {
    console.log(`📦 Installing dependencies with ${projectInfo.packageManager}...`)
    await installDependencies(projectName, projectInfo.packageManager)
    
    console.log('🔧 Generating Cloudflare Workers types...')
    await generateCloudflareTypes(projectName, projectInfo.packageManager)
  }
}

async function copyTemplateFiles(templateDir: string, projectDir: string, projectInfo: ProjectInfo): Promise<void> {
  const { readdir } = await import('fs/promises')
  const entries = await readdir(templateDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(templateDir, entry.name)
    const destPath = join(projectDir, entry.name)

    if (entry.isDirectory()) {
      await copyTemplateFiles(srcPath, destPath, projectInfo)
    } else if (entry.name === 'package.json.template') {
      // Process package.json template
      await processTemplate(srcPath, join(projectDir, 'package.json'), projectInfo)
    } else if (entry.name.endsWith('.template')) {
      // Process other template files
      const outputName = entry.name.replace('.template', '')
      await processTemplate(srcPath, join(projectDir, outputName), projectInfo)
    } else {
      // Copy regular files with template processing
      await processTemplate(srcPath, destPath, projectInfo)
    }
  }
}

async function processTemplate(srcPath: string, destPath: string, projectInfo: ProjectInfo): Promise<void> {
  let content: string

  try {
    content = await readFile(srcPath, 'utf-8')
  } catch (error) {
    // If file is binary or can't be read as text, copy as-is
    const { copyFile } = await import('fs/promises')
    await mkdir(dirname(destPath), { recursive: true })
    await copyFile(srcPath, destPath)
    return
  }

  // Replace template placeholders
  const processedContent = content
    .replace(/{{projectName}}/g, projectInfo.projectName)
    .replace(/{{projectTitle}}/g, projectInfo.projectTitle)
    .replace(/{{currentDate}}/g, getCurrentDate())
    .replace(/{{packageManager}}/g, projectInfo.packageManager)

  await mkdir(dirname(destPath), { recursive: true })
  await writeFile(destPath, processedContent, 'utf-8')
}

async function initGitRepo(projectDir: string): Promise<void> {
  const { spawn } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(spawn)

  try {
    await new Promise<void>((resolve, reject) => {
      const git = spawn('git', ['init'], { 
        cwd: projectDir,
        stdio: 'ignore'
      })
      
      git.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Git init failed with code ${code}`))
        }
      })
      
      git.on('error', reject)
    })

    // Create initial .gitignore
    const gitignoreContent = `
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
dist/

# Environment variables
.env*
!.env.example

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Wrangler
.wrangler/
`.trim()

    await writeFile(join(projectDir, '.gitignore'), gitignoreContent)
  } catch (error) {
    console.warn('⚠️  Failed to initialize git repository:', error)
  }
}

async function installDependencies(projectDir: string, packageManager: string): Promise<void> {
  const { spawn } = await import('child_process')

  const installCommand = packageManager === 'yarn' ? 'install' : 'install'
  
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(packageManager, [installCommand], {
        cwd: projectDir,
        stdio: 'inherit'
      })
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Installation failed with code ${code}`))
        }
      })
      
      child.on('error', reject)
    })
  } catch (error) {
    console.warn(`⚠️  Failed to install dependencies with ${packageManager}:`, error)
    console.log(`You can install them manually by running: cd ${projectDir} && ${packageManager} install`)
  }
}

async function generateCloudflareTypes(projectDir: string, packageManager: string): Promise<void> {
  const { spawn } = await import('child_process')

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(packageManager, ['run', 'cf-typegen'], {
        cwd: projectDir,
        stdio: 'inherit'
      })
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`cf-typegen failed with code ${code}`))
        }
      })
      
      child.on('error', reject)
    })
  } catch (error) {
    console.warn('⚠️  Failed to generate Cloudflare Workers types:', error)
    console.log(`You can generate them manually by running: cd ${projectDir} && ${packageManager} run cf-typegen`)
  }
}