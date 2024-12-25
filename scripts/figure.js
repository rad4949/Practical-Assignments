const RuledRotorCylindroid = (u, v, uStep, vStep, a, b, n, m) => {
    const x = (a + b * sin(n * u)) * cos(u) - v * sin(u)
    const y = (a + b * sin(n * u)) * sin(u) - v * cos(u)
    const z = b * cos(n * u)
    return [m * x, m * y, m * z]
}
function CreateSurfaceData(obj) {
    const { vRange, uStep, vStep, a, b, n, m
    } = obj
    let vertexList = [];
    const uRange = PI * 2;
    for (let u = 0; u < uRange; u += uStep) {
        for (let v = 0; v < vRange; v += vStep) {
            const vertex = RuledRotorCylindroid(u, v, uStep, vStep, a, b, n, m)
            vertexList.push(...vertex)
        }
    }
    for (let v = 0; v < vRange; v += vStep) {
        for (let u = 0; u < uRange; u += uStep) {
            const vertex = RuledRotorCylindroid(u, v, uStep, vStep, a, b, n, m)
            vertexList.push(...vertex)
        }
    }
    return vertexList;
}