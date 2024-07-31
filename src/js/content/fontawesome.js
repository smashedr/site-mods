// JS Content Script

;(async () => {
    console.info('site-tools: fontawesome.js')
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
            // console.debug('el:', el)
            if (
                el.nodeName === 'DIV' &&
                el.classList?.contains('icon-detail')
            ) {
                console.log('icon-detail:', el)
                const parent = el.querySelector('.icon-detail .text-left')
                const name = el.querySelector(
                    '.icon-details-preview-rendering i'
                ).className
                addCopyBtn(name, parent)
            }
        })
    }
}

function addCopyBtn(name, parent) {
    console.log(`addCopyBtn: ${name}`, parent)
    const link = document.createElement('a')
    link.textContent = 'Copy Class'
    link.dataset.name = name
    link.href = '#0'
    link.addEventListener('click', copyClick)
    parent.appendChild(link)
}

async function copyClick(event) {
    console.log('copyClick:', event)
    event.preventDefault()
    await navigator.clipboard.writeText(event.target.dataset.name)
}
