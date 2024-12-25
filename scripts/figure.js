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
    let indexList = [];
    const uRange = PI * 2;
    const uCount = uRange / uStep;
    const vCount = vRange / vStep;

    // use vCount when forming indexes
    // for (let u = 0; u < uRange; u += uStep) {
    //     for (let v = 0; v < vRange; v += vStep) {
    //         const vertex = RuledRotorCylindroid(u, v, uStep, vStep, a, b, n, m)
    //         vertexList.push(...vertex)
    //     }
    // }

    // use uCount when forming indexes
    for (let v = 0; v < vRange; v += vStep) {
        for (let u = 0; u < uRange; u += uStep) {
            const vertex = RuledRotorCylindroid(u, v, uStep, vStep, a, b, n, m)
            vertexList.push(...vertex)
        }
    }
    for (let i = 0; i < vertexList.length / 3; i++) {
        // for line_strip only i
        indexList.push(i)
        indexList.push(i + 1)
        indexList.push(i + uCount + 1)
        indexList.push(i + uCount + 1)
        indexList.push(i)
        indexList.push(i + uCount)
    }
    const normalList = calculateNormals(vertexList);
    const lists = [vertexList, indexList, normalList]
    return lists
}

function calculateNormals(vertexList) {
    const normals = new Array(vertexList.length).fill(0); // Initialize normals array

    // Iterate over each triangle
    for (let i = 0; i < vertexList.length; i += 9) {
        // Get the vertices of the triangle

        const v0 = vertexList.slice(i, i + 3);
        const v1 = vertexList.slice(i + 3, i + 6);
        const v2 = vertexList.slice(i + 6, i + 9);;

        // Calculate two edge vectors
        const edge1 = m4.subtractVectors(v1, v0)
        const edge2 = m4.subtractVectors(v2, v0)
        // Compute the cross product (normal)
        let normal = m4.cross(edge1, edge2)

        // Normalize the normal vector
        normal = m4.normalize(normal)

        // Add the normal to each vertex of the triangle
        for (let j = 0; j < 3; j++) {
            const idx = i + j * 3;
            normals[idx] += normal[0];
            normals[idx + 1] += normal[1];
            normals[idx + 2] += normal[2];
        }
    }

    // Normalize all vertex normals
    for (let i = 0; i < normals.length; i += 3) {
        const length = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2);
        if (length > 0) {
            normals[i] /= length;
            normals[i + 1] /= length;
            normals[i + 2] /= length;
        }
    }

    return normals;
}