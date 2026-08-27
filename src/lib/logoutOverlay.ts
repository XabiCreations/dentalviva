export function showLogoutOverlay(): Promise<void> {
  return new Promise(resolve => {
    const style = document.createElement('style')
    style.textContent = '@keyframes _lspin{to{transform:rotate(360deg)}}'
    document.head.appendChild(style)

    const overlay = document.createElement('div')
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'background:rgba(255,255,255,0.85)', 'backdrop-filter:blur(6px)',
      '-webkit-backdrop-filter:blur(6px)',
    ].join(';')

    const spinner = document.createElement('div')
    spinner.style.cssText = [
      'width:40px', 'height:40px', 'border-radius:50%',
      'border:3px solid #e5e7eb',
      'border-top-color:#3b82f6',
      'animation:_lspin 0.65s linear infinite',
    ].join(';')

    overlay.appendChild(spinner)
    document.body.appendChild(overlay)

    setTimeout(() => {
      resolve()
      setTimeout(() => { overlay.remove(); style.remove() }, 400)
    }, 500)
  })
}
