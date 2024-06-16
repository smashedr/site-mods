// JS Content Script

;(async () => {
    console.info('site-mods: content-script.js')
    const observer = new MutationObserver(mutationObserver)
    observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
    })
    // if (window.location.pathname.startsWith('/search/')) {
    //     const observer = new MutationObserver(mutationObserver)
    //     observer.observe(document, {
    //         attributes: true,
    //         childList: true,
    //         subtree: true,
    //     })
    // } else if (window.location.pathname.startsWith('/free-icon/')) {
    //     const detail = document.getElementById('detail')
    //     console.debug('detail:', detail)
    //     const download = document.getElementById('download')
    //     console.debug('download:', download)
    //     const link = download.querySelector('a')
    //     link.dataset.png = detail.dataset.png
    //     link.dataset.name = detail.dataset.name
    //     link.addEventListener('click', downloadItem)
    //     console.debug('link:', link)
    // }
})()

function mutationObserver(mutationList) {
    // console.debug('mutationList:', mutationList)
    for (const mutation of mutationList) {
        // console.debug('mutation:', mutation)
        mutation.addedNodes.forEach((el) => {
            // console.debug('el:', el)
            if (
                el.nodeName === 'LI' &&
                el.classList?.contains('icon--item') &&
                el.dataset.png
            ) {
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
            if (el.id === 'download') {
                console.log('DOWNLOAD:', el)
                const detail = document.getElementById('detail')
                console.debug('detail:', detail)
                // const download = document.getElementById('download')
                // console.debug('download:', download)

                document
                    .getElementById('fi-premium-download-buttons')
                    .classList.remove('modal-download--target')

                const link = el.querySelector('a')
                link.dataset.png = detail.dataset.png
                link.dataset.name = detail.dataset.name
                // link.replaceWith(link.cloneNode(true))
                link.addEventListener('click', downloadItem)
                console.debug('link:', link)
            }
        })
    }
}

async function downloadItem(event) {
    console.debug('downloadItem:', event)
    event.preventDefault()
    const link = event.target.closest('a') || event.target.closest('li')
    console.debug('link:', link)
    if (link.dataset.png) {
        const name = link.dataset.name.toLowerCase().replace(' ', '-')
        const message = { download: link.dataset.png, name: `${name}.png` }
        console.log('message:', message)
        try {
            await chrome.runtime.sendMessage(message)
        } catch (e) {
            console.log(e)
        }
    }
}
