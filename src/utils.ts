import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export function validateProjectName(name: string): boolean {
  // Check if valid npm package name
  const validPackageName = /^[a-z0-9][a-z0-9._-]*$/
  return validPackageName.test(name) && name.length > 0 && name.length <= 214
}

export function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

export async function copyDirectory(src: string, dest: string): Promise<void> {
  const { mkdir, copyFile } = await import('fs/promises')
  
  try {
    await mkdir(dest, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }

  const entries = await readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
}