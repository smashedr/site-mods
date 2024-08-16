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
                const icon = el.querySelector('.icon-action-glyph-copy i')
                console.log('icon:', icon)
                addCopyBtn(icon.className, parent)
                el.querySelector('#icon_style')?.addEventListener(
                    'click',
                    updateText
                )
            }
        })
    }
}

function updateText() {
    const el = document.querySelector('.icon-detail')
    const icon = el.querySelector('.icon-action-glyph-copy i')
    console.log('icon:', icon)
    const text = icon.className.split(' fa-lg ')[0]
    console.log('text:', text)
    const link = document.getElementById('copy-class-link')
    console.log('link:', link)
    link.dataset.name = text
}

function addCopyBtn(name, parent) {
    console.log(`addCopyBtn: ${name}`, parent)
    const text = name.split(' fa-lg ')[0]
    console.log('name:', text)
    const link = document.createElement('a')
    link.id = 'copy-class-link'
    link.textContent = 'Copy Class'
    link.dataset.name = text
    link.href = '#0'
    link.addEventListener('click', copyClick)
    parent.appendChild(link)
}

async function copyClick(event) {
    console.log('copyClick:', event)
    event.preventDefault()
    await navigator.clipboard.writeText(event.target.dataset.name)
}
