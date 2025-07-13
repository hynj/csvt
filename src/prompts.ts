import * as p from '@clack/prompts'
import { validateProjectName, toTitleCase } from './utils.ts'

export interface ProjectInfo {
  projectName: string
  projectTitle: string
  packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm'
  installDeps: boolean
  initGit: boolean
}

export async function getProjectInfo(initialProjectName: string, flags: any): Promise<ProjectInfo> {
  // Determine package manager from flags
  let packageManager: ProjectInfo['packageManager'] = 'bun'
  if (flags['use-npm']) packageManager = 'npm'
  else if (flags['use-yarn']) packageManager = 'yarn'
  else if (flags['use-pnpm']) packageManager = 'pnpm'

  const responses = await p.group(
    {
      projectName: () => p.text({
        message: 'Project name:',
        initialValue: initialProjectName,
        validate: (value) => {
          if (!value) return 'Project name is required'
          if (!validateProjectName(value)) {
            return 'Project name must be lowercase, no spaces, and valid for npm'
          }
        },
      }),
      projectTitle: ({ results }) => p.text({
        message: 'Project title:',
        initialValue: toTitleCase(results.projectName || initialProjectName),
        validate: (value) => {
          if (!value) return 'Project title is required'
        },
      }),
      packageManager: () => 
        flags['use-npm'] || flags['use-yarn'] || flags['use-pnpm'] ? undefined : p.select({
          message: 'Package manager:',
          options: [
            { value: 'bun', label: 'bun (recommended)' },
            { value: 'npm', label: 'npm' },
            { value: 'yarn', label: 'yarn' },
            { value: 'pnpm', label: 'pnpm' },
          ],
          initialValue: 'bun',
        }),
      installDeps: () => 
        flags['no-install'] ? undefined : p.confirm({
          message: 'Install dependencies?',
          initialValue: true,
        }),
      initGit: () => 
        flags['no-git'] ? undefined : p.confirm({
          message: 'Initialize git repository?',
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.')
        process.exit(0)
      },
    }
  )

  return {
    projectName: responses.projectName!,
    projectTitle: responses.projectTitle!,
    packageManager: responses.packageManager || packageManager,
    installDeps: flags['no-install'] ? false : (responses.installDeps ?? true),
    initGit: flags['no-git'] ? false : (responses.initGit ?? true),
  }
}