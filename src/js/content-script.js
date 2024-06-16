// JS Content Script

;(async () => {
    console.info('site-mods: content-script.js')
    const observer = new MutationObserver(mutationObserver)
    observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
    })
})()

function mutationObserver(mutationList) {
    // console.debug('mutationList:', mutationList)
    for (const mutation of mutationList) {
        // console.debug('mutation:', mutation)
        mutation.addedNodes.forEach((el) => {
            if (
                el.nodeName === 'LI' &&
                el.classList?.contains('icon--item') &&
                el.dataset.png
            ) {
                // console.debug('el:', el)
                // console.debug('el.dataset:', el.dataset)

                /** @type {HTMLLIElement} */
                const li = el.querySelector('li.download-png-svg-list')
                if (!li) {
                    return
                }
                li.dataset.png = el.dataset.png
                li.dataset.name = el.dataset.name
                li.addEventListener('click', downloadItem)
                const button = li.querySelector('button')
                button.classList.remove(
                    'popover-button',
                    'tooltip__trigger',
                    'tooltip__trigger--always',
                    'popover--bottom-right'
                )

                // const source = el.querySelector('li.download-png-svg-list')
                // const li = source.cloneNode(true)
                // source.parentNode.appendChild(li)

                // const download = el.querySelector('button.bj-button--green')
                // const cloned = download.cloneNode(true)
                // cloned.addEventListener('click', linkClick)
                // cloned.dataset.png = el.dataset.png
                // download.parentNode.replaceChild(cloned, download)
            }
        })
    }
}

async function downloadItem(event) {
    console.debug('downloadItem:', event)
    event.preventDefault()
    const li = event.target.closest('li')
    // console.debug('li:', li)
    if (li.dataset.png) {
        const name = li.dataset.name.toLowerCase().replace(' ', '-')
        const message = { download: li.dataset.png, name: `${name}.png` }
        console.log('message:', message)
        try {
            await chrome.runtime.sendMessage(message)
        } catch (e) {
            console.log(e)
        }
    }
}
