# GLTF transform ktx texture compression

Browser compatible @gltf-transform/core function to compress textures in ktx2 format similar to the textureCompress function.

## Usage

```javascript

import { dedup, flatten, instance, join, palette, prune, resample, simplify, sparse, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { textureCompressKTX2 } from "gltf-transform-function-ktx2"

/**
 * Example optimization pipeline implemented with the glTF Transform API.
 * Some optimizations, including KTX2 compression, require Node.js or CLI
 * environments. See https://gltf-transform.dev/ for full functionality.
 */

await document.transform(
	// Remove duplicate meshes, materials, textures, etc.
	dedup(),

	// Create GPU instancing batches for meshes used 5+ times.
	instance({ min: 5 }),

	// Create palette textures for compatible groups of 5+ materials.
	palette({ min: 5 }),

	// Reduce nesting of the scene graph; required for join().
	flatten(),

	// Join compatible meshes.
	join(),

	// Weld (index) all mesh geometry, removing duplicate vertices.
	weld(),

	// Simplify mesh geometry with meshoptimizer.
	simplify({
		simplifier: MeshoptSimplifier,
		error: 0.0001,
		ratio: 0.0,
		lockBorder: true,
	}),

	// Losslessly resample animation frames.
	resample(),

	// Remove unused nodes, textures, materials, etc.
	prune(),

	// Create sparse accessors where >80% of values are zero.
	sparse({ ratio: 0.2 }),

	// Resize all textures to ≤1K and convert to KTX2.
	textureCompressKTX2({ resize: [1024, 1024] }),
);
```
