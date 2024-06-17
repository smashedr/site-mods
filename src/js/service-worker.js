// JS Background Service Worker

import { activateOrOpen, checkPerms, contentScripts } from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onMessage.addListener(onMessage)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus()
        }
    }
}

/**
 * On Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/smashedr/site-tools'
    // const uninstallURL = new URL('https://link-extractor.cssnr.com/uninstall/')
    const options = await Promise.resolve(
        setDefaultOptions({
            contextMenu: true,
            showUpdate: false,
            contentScripts: {
                flaticon: true,
            },
        })
    )
    console.debug('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    const manifest = chrome.runtime.getManifest()
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const hasPerms = await checkPerms()
        if (hasPerms) {
            chrome.runtime.openOptionsPage()
        } else {
            const url = chrome.runtime.getURL('/html/permissions.html')
            await chrome.tabs.create({ active: true, url })
        }
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ active: false, url })
            }
        }
    }
    // uninstallURL.searchParams.append('version', manifest.version)
    // console.log('uninstallURL:', uninstallURL.href)
    // await chrome.runtime.setUninstallURL(uninstallURL.href)
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
    await registerContentScripts()
}

/**
 * On Clicked Callback
 * @function onClicked
 * @param {OnClickData} ctx
 * @param {Tab} tab
 */
async function onClicked(ctx, tab) {
    console.debug('onClicked:', ctx, tab)
    if (ctx.menuItemId === 'openOptions') {
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'openHome') {
        const url = chrome.runtime.getURL('/html/home.html')
        await activateOrOpen(url)
    } else if (ctx.menuItemId === 'showPanel') {
        await chrome.windows.create({
            type: 'panel',
            url: '/html/panel.html',
            width: 720,
            height: 480,
        })
    } else {
        console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.debug(`onCommand: ${command}`)
    if (command === 'openHome') {
        const url = chrome.runtime.getURL('/html/home.html')
        await activateOrOpen(url)
    } else if (command === 'showPanel') {
        await chrome.windows.create({
            type: 'panel',
            url: '/html/panel.html',
            width: 480,
            height: 360,
        })
    }
}

/**
 * On Message Callback
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 */
function onMessage(message, sender) {
    console.debug('onMessage: message, sender:', message, sender)
    if (message.download) {
        const download = { url: message.download }
        if (message.name) {
            download.filename = message.name
        }
        return chrome.downloads.download(download)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    // console.debug('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (oldValue.contextMenu !== newValue.contextMenu) {
                if (newValue?.contextMenu) {
                    console.info('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.info('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            }
            for (const [subKey, subValue] of Object.entries(
                newValue.contentScripts
            )) {
                console.log(`subKey: ${subKey} - subValue:'`, subValue)
                if (
                    oldValue.contentScripts[subKey] !==
                    newValue.contentScripts[subKey]
                ) {
                    console.log(`UPDATE CONTENT SCRIPT: ${subKey}`)
                    try {
                        if (subValue) {
                            const script = contentScripts[subKey]
                            console.log('registerContentScripts:', script)
                            await chrome.scripting.registerContentScripts([
                                script,
                            ])
                        } else {
                            console.log('unregisterContentScripts:', subKey)
                            await chrome.scripting.unregisterContentScripts({
                                ids: [subKey],
                            })
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
    }
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus() {
    console.debug('createContextMenus')
    chrome.contextMenus.removeAll()
    const contexts = [
        [['all'], 'openHome', 'normal', 'Home Page'],
        [['all'], 'showPanel', 'normal', 'Extension Panel'],
        [['all'], 's-2', 'separator', 'separator'],
        [['all'], 'openOptions', 'normal', 'Open Options'],
    ]
    contexts.forEach((context) => {
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            type: context[2],
            title: context[3],
        })
    })
}

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Object}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { options } = await chrome.storage.sync.get(['options'])
    options = options || {}
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set ${key}:`, value)
        }
    }
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}

/**
 * Register Content Scripts
 * @function registerDarkMode
 */
async function registerContentScripts() {
    console.log('registerContentScripts')
    const { options } = await chrome.storage.sync.get(['options'])
    for (const [key, script] of Object.entries(contentScripts)) {
        // console.log('options.contentScripts[key]:', options.contentScripts[key])
        if (options.contentScripts[key]) {
            console.log('Registering Enabled Script:', script)
            try {
                await chrome.scripting.registerContentScripts([script])
            } catch (e) {
                console.warn('registerContentScripts', e)
            }
        }
    }
}
