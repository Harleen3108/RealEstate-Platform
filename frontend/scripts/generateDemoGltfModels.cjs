const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function buildModel(fileName, options) {
  const {
    scale = [1, 1, 1],
    color = [0.75, 0.75, 0.78, 1.0],
    metallic = 0.15,
    roughness = 0.68,
  } = options;

  const positions = new Float32Array([
    -1, 0, -1,
    1, 0, -1,
    1, 0, 1,
    -1, 0, 1,
    -1, 1.2, -1,
    1, 1.2, -1,
    1, 1.2, 1,
    -1, 1.2, 1,
    0, 1.8, -1,
    0, 1.8, 1,
  ]);

  const indices = new Uint16Array([
    0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
    4, 8, 9, 4, 9, 7,
    5, 6, 9, 5, 9, 8,
    4, 5, 8,
    7, 9, 6,
    0, 3, 2, 0, 2, 1,
  ]);

  const positionBuffer = Buffer.from(positions.buffer);
  const indexBuffer = Buffer.from(indices.buffer);
  const binBuffer = Buffer.concat([positionBuffer, indexBuffer]);
  const base64 = binBuffer.toString('base64');

  const min = [-1, 0, -1];
  const max = [1, 1.8, 1];

  const gltf = {
    asset: { version: '2.0', generator: 'MillionaireClub-DemoModelGenerator' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, scale }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: color,
          metallicFactor: metallic,
          roughnessFactor: roughness,
        },
      },
    ],
    buffers: [
      {
        uri: `data:application/octet-stream;base64,${base64}`,
        byteLength: binBuffer.byteLength,
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: positionBuffer.byteLength,
        target: 34962,
      },
      {
        buffer: 0,
        byteOffset: positionBuffer.byteLength,
        byteLength: indexBuffer.byteLength,
        target: 34963,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: 'VEC3',
        min,
        max,
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: indices.length,
        type: 'SCALAR',
        min: [0],
        max: [9],
      },
    ],
  };

  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(gltf, null, 2), 'utf8');
  return filePath;
}

const created = [];
created.push(buildModel('house-modern.gltf', {
  scale: [1.3, 1.05, 1.2],
  color: [0.82, 0.82, 0.86, 1],
  metallic: 0.12,
  roughness: 0.62,
}));
created.push(buildModel('villa-luxe.gltf', {
  scale: [1.7, 1.2, 1.5],
  color: [0.74, 0.66, 0.58, 1],
  metallic: 0.22,
  roughness: 0.5,
}));
created.push(buildModel('penthouse-glass.gltf', {
  scale: [1.1, 1.35, 1.1],
  color: [0.58, 0.72, 0.83, 1],
  metallic: 0.35,
  roughness: 0.3,
}));

console.log('Created demo models:');
created.forEach((f) => console.log('-', f));
