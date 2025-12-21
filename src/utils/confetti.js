// Simple confetti animation using CSS
export default function confetti() {
  const colors = ['#46ec13', '#3cd610', '#2db00d', '#ffffff']
  const confettiCount = 50

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `
  document.body.appendChild(container)

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = Math.random() * 10 + 5
    const left = Math.random() * 100
    const delay = Math.random() * 0.5
    const duration = Math.random() * 2 + 2

    confetti.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${duration}s ease-out ${delay}s forwards;
      transform: rotate(${Math.random() * 360}deg);
    `
    container.appendChild(confetti)
  }

  // Add animation keyframes if not exists
  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style')
    style.id = 'confetti-styles'
    style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Remove container after animation
  setTimeout(() => {
    container.remove()
  }, 4000)
}
