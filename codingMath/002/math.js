window.onload = function() {
    const   canvas = document.getElementById("canvas"),
            context = canvas.getContext('2d'),
            width = canvas.width = window.innerWidth,
            height = canvas.height = window.innerHeight

    // Careful these order of op's matter
    context.translate(0, height / 2) // move down
    context.scale(1, -1) // flip around since screen coord system is oppose than cartesian.
    
    for(let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        const magnifyingFactor = 200 // to make it larger
        const y = Math.sin(angle) * magnifyingFactor
        const x = angle * magnifyingFactor

        context.fillRect(x, y, 5, 5)
    }
}