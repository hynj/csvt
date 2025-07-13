import { parseArgs } from 'util'
import { createProject } from './template.ts'
import { getProjectInfo } from './prompts.ts'
import { validateProjectName } from './utils.ts'

export async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      template: { type: 'string', short: 't', default: 'default' },
      'no-git': { type: 'boolean' },
      'no-install': { type: 'boolean' },
      'use-npm': { type: 'boolean' },
      'use-yarn': { type: 'boolean' },
      'use-pnpm': { type: 'boolean' },
    },
    allowPositionals: true,
  })

  if (values.help) {
    showHelp()
    return
  }

  let projectName = positionals[0]
  
  if (!projectName) {
    projectName = process.cwd().split('/').pop() || 'my-cf-svelte-app'
  }

  if (!validateProjectName(projectName)) {
    console.error('❌ Invalid project name. Must be lowercase with no spaces.')
    process.exit(1)
  }

  console.log('🚀 Welcome to create-csvt!')
  console.log('')

  const projectInfo = await getProjectInfo(projectName, values)
  
  try {
    await createProject(projectInfo)
    
    console.log('')
    console.log('✨ Project created successfully!')
    console.log('')
    console.log('Next steps:')
    console.log(`  cd ${projectInfo.projectName}`)
    console.log(`  ${projectInfo.packageManager} run dev`)
    console.log('')
    console.log('Available commands:')
    console.log('  • dev     - Start development server')
    console.log('  • build   - Build for production')
    console.log('  • preview - Preview production build')
    console.log('  • deploy  - Deploy to Cloudflare Workers')
    console.log('  • check   - Type check the project')
    console.log('')
    console.log('Happy coding! 🚀')
  } catch (error) {
    console.error('❌ Error creating project:', error)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🚀 create-csvt

Create a new CSVT stack project (Cloudflare Workers + Svelte + Vite + Tailwind)

Usage:
  bun create csvt [project-name] [options]
  npm create csvt@latest [project-name] [options]

Options:
  -h, --help        Show this help message
  -t, --template    Template to use (default: default)
  --no-git          Skip git initialization
  --no-install      Skip dependency installation
  --use-npm         Use npm as package manager
  --use-yarn        Use yarn as package manager
  --use-pnpm        Use pnpm as package manager

Examples:
  bun create csvt my-app
  npm create csvt@latest my-app --use-npm
  bun create csvt my-app --no-git --no-install
`)
}