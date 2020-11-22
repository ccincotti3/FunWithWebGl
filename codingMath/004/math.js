window.onload = function() {
  const canvas = document.getElementById("canvas"),
    context = canvas.getContext('2d'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight
  
  // Set center of circle.
  // Remember (0,0) is top left of viewport.
  const centerX = width / 2
  const centerY = height / 2

  const radius = 200
  const totalObjects = 30
  let angle = 0

  context.clearRect(0,0,width,height)

  for (let i = 0; i < totalObjects; i++) {
    // x = rcos(ø)
    x = centerX + radius * Math.cos(angle)
    // y = rsin(ø)
    y = centerY + radius * Math.sin(angle)

    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2, false)
    context.fill()

    angle += Math.PI * 2 / totalObjects
  }
  
}