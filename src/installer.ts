import * as tc from '@actions/tool-cache'
import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs'

export async function installAzCopy(version: string): Promise<string> {
  if (version !== 'v10') {
    throw new Error('version must be set `v10`.')
  }
  const downloadUrl: string = getDownloadUrl()
  let downloadPath: string | null = null
  try {
    downloadPath = await tc.downloadTool(downloadUrl)
  } catch (error) {
    core.debug(error)

    throw new Error(`Failed to download version ${version}: ${error}`)
  }
  const extPath = IS_WINDOWS
    ? await tc.extractZip(downloadPath)
    : await tc.extractTar(downloadPath)
  const files = fs.readdirSync(extPath, {withFileTypes: true})
  let toolPath = path.join(extPath, files[0].name) //first file has azcopy
  if (IS_WINDOWS) {
    toolPath = path.join(toolPath, 'azcopy.exe')
    toolPath = await tc.cacheFile(
      toolPath,
      'azcopyV10.exe',
      'azcopyV10.exe',
      version
    )
  } else {
    toolPath = path.join(toolPath, 'azcopy')
    toolPath = await tc.cacheFile(toolPath, 'azcopyV10', 'azcopyV10', version)
  }
  core.debug(toolPath)
  //  core.addPath(toolPath)
  // try {
  //   core.debug('alias setting started')
  //   if (IS_WINDOWS) {
  //     await exec.exec(`doskey azcopy.exe='${toolPath}'`, [], {})
  //   } else {
  //     await exec.exec(`alias azcopy='${toolPath}'`, [], {})
  //   }
  //   core.debug('alias setting finished')
  // } catch (error) {
  //   core.error(
  //     `set alias failed. message:${error.message} toolPath:${toolPath}`
  //   )
  //   core.setFailed(error.message)
  // }
  return toolPath
}

const IS_WINDOWS = process.platform === 'win32'

// https://docs.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10
function getDownloadUrl(): string {
  if (IS_WINDOWS) {
    return 'https://aka.ms/downloadazcopy-v10-windows'
  } else {
    return 'https://aka.ms/downloadazcopy-v10-linux'
  }
}
