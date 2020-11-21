window.onload = function() {
  const   canvas = document.getElementById("canvas"),
    context = canvas.getContext('2d'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight

  // Animating an Object

  // Center on canvas
  const centerY = height * 0.5
  const centerX = width * 0.5

  // How far to move the object on canvas
  const offset = height * 0.4 

  let speed = 0.1
  let angle = 0

  render()

  function render() {
    let y = centerY + Math.sin(angle) * offset

    context.clearRect(0,0,width,height)
    context.beginPath();
    context.arc(centerX, y, 50, 0, Math.PI * 2, false);
    context.fillStyle = "red"
    context.fill()

    angle += speed
    requestAnimationFrame(render)
  }
}