window.onload = function() {
  const canvas = document.getElementById("canvas"),
    context = canvas.getContext('2d'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight
  
  // Set center of circle.
  // Remember (0,0) is top left of viewport.
  const centerX = width / 2
  const centerY = height / 2

  // const radius = 200
  const xRadius = 200
  const yRadius = 400
  const speed = .01

  let angle = 0, x, y
  
  render()
  
  function render() {
    context.clearRect(0,0,width,height)

    // Need to bias by our center coord

    // x = rcos(ø)
    x = centerX + xRadius * Math.cos(angle)
    // y = rsin(ø)
    y = centerY + yRadius * Math.sin(angle)

    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2, false)
    context.fill()

    angle += speed

    requestAnimationFrame(render)
  }
}