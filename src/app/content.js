import mermaidAPI from 'mermaid'


chrome.runtime.sendMessage({}, (response) => {
  var checkReady = setInterval(() => {
      if (document.readyState === "complete") {
          clearInterval(checkReady)
          main()
      }
  })
})

mermaidAPI.initialize({
    startOnLoad: false
})

const isMermaidCodeBlock = (cb) => {
    return cb.innerText.search(/graph|pie|gantt|sequenceDiagram|classDiagram/) !== -1
}

function convertCb(target, id) {
    //target.querySelector("code").innerText = ''
    const parent = target.parentNode
    const container = document.createElement("div")
    parent.appendChild(container)
    //target.querySelectorAll(".linenumber").forEach(k => k.innerText = '')
    //container.setAttribute("id", id)
    target.setAttribute("processed", "true");
    let code = target.innerText.trim()
    code = code.replaceAll(/(^|\n)\d+/g, '$1')
    console.log(code)
    const canParse = mermaidAPI.parse(code);
    if(canParse) {
      mermaidAPI.render(
      id, code, (svg) => {
        target.innerHTML = svg;
      })
    }

}

function processUnprocessedElements(idIterator) {
    let codeBlocks = [...document.querySelectorAll("div[data-code-block]:not([processed])")]
    codeBlocks = codeBlocks.filter(isMermaidCodeBlock)
    codeBlocks.forEach(
        cb => {
                convertCb(cb, idIterator.next().value)
        }
    )
}

function *idGenerator() {
  for (let i = 0; true; i++) {
    yield `github-mermaid-extension-${i}`
  }
}

const globalIdIterator = idGenerator()

const main = () => {
  new MutationObserver(
    () => processUnprocessedElements(globalIdIterator)
).observe(
    document.body,
    {childList: true, subtree: true}
)

// Initial pass
processUnprocessedElements(globalIdIterator)
}
// Observe nodeList and attribute changes on the page, and
// process all unprocessed elements on the page.
