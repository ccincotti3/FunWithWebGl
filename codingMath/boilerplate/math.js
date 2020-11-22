window.onload = function() {
  const canvas = document.getElementById("canvas"),
    context = canvas.getContext('2d'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight
  
  
  render()
  
  function render() {
    context.clearRect(0,0,width,height)

    requestAnimationFrame(render)
  }
}