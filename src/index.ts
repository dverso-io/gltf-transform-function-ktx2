import { Document, FileUtils } from "@gltf-transform/core";
import { KHRTextureBasisu } from "../node_modules/@gltf-transform/extensions/src/khr-texture-basisu/texture-basisu";
import BASIS from "./basis_encoder";
//@ts-ignore
import wasmBinary from "./basis_encoder.wasm?arraybuffer";

let encoder : IBasisEncoder;

export const enum BasisTextureType {
    cBASISTexType2D,
    cBASISTexType2DArray,
    cBASISTexTypeCubemapArray,
    cBASISTexTypeVideoFrames,
    cBASISTexTypeVolume
}

/** image source type */
export const enum SourceType {
    RAW,
    PNG
}

export interface IBasisEncoder {
  /**
   * Sets the slice's source image, either from a PNG file or from a raw 32-bit RGBA raster image.
   * The first texel is the top-left texel. The texel byte order in memory is R,G,B,A (R first at offset 0, A last at offset 3).
   * @param sliceIndex sliceIndex is the slice to change. Valid range is [0,BASISU_MAX_SLICES-1].
   * @param imageBuffer png image buffer or 32bit RGBA raster image buffer
   * @param width if isPNG is true, width set 0.
   * @param height if isPNG is true, height set 0.
   * @param type type of the input source.
   */
  setSliceSourceImage(
    sliceIndex: number,
    imageBuffer: Uint8Array,
    width: number,
    height: number,
    type: SourceType
  ): void;
  /**
   * Compresses the provided source slice(s) to an output .basis file.
   * At the minimum, you must provided at least 1 source slice by calling setSliceSourceImage() before calling this method.
   * @param pngBuffer
   * @returns byte length of encoded data
   */
  encode(pngBuffer: Uint8Array): number;
  /**
   * If true, the encoder will output a UASTC texture, otherwise a ETC1S texture.
   * @param isUASTC
   */
  setUASTC(isUASTC: boolean): void;
  /**
   * Sets the basis texture type, default is cBASISTexType2D
   * @param texType texType is enum BasisTextureType
   */
  setTexType(texType: BasisTextureType): void;
  /**
   * Use UASTC Zstandard supercompression. Defaults to disabled or KTX2_SS_NONE
   */
  setKTX2UASTCSupercompression(needSupercompression: boolean): void;
  /**
   * If true the source images will be Y flipped before compression.
   */
  setYFlip(isYFlip: boolean): void;
  /**
   * Enables debug output	to stdout
   * @param isDebug
   */
  setDebug(isDebug: boolean): void;
  /**
   * Sets the ETC1S encoder's quality level, which controls the file size vs. quality tradeoff.
   * Default is -1 (meaning unused - the compressor will use m_max_endpoint_clusters/m_max_selector_clusters instead to control the codebook sizes).
   * @param level Range is [1, 255]
   */
  setQualityLevel(level: number): void;
  /**
   * The compression_level parameter controls the encoder perf vs. file size tradeoff for ETC1S files.
   * @param level Default is 2, range is [0, 6]
   */
  setCompressionLevel(level: number): void;
  /**
   * setNormalMapMode is the same as the basisu.exe "-normal_map" option. It tunes several codec parameters so compression works better on normal maps.
   * @param isNormalMap
   */
  setNormalMap(isNormalMap: boolean): void;
  /**
   * Create .KTX2 files instead of .basis files. By default this is FALSE.
   * @param isKTX2
   */
  setCreateKTX2File(isKTX2: boolean): void;
  /**
   * If true mipmaps will be generated from the source images
   * @param needGenMipmap
   */
  setMipGen(needGenMipmap: boolean): void;
  /**
   * Use sRGB transfer func in the file's DFD. Default is FALSE. This should very probably match the "perceptual" setting.
   * @param srgbTransferFunc need sRGB transfer func
   */
  setKTX2SRGBTransferFunc(srgbTransferFunc: boolean): void;
  /**
   * If true, the input is assumed to be in sRGB space. Be sure to set this correctly! (Examples: True on photos, albedo/spec maps, and false on normal maps.)
   */
  setPerceptual(perceptual: boolean): void;

  /** release memory */
  delete(): void;

  /** If true, the RDO post-processor will be applied to the encoded UASTC texture data. */
  setRDOUASTC(rdoUASTC: boolean): void;

  // Default is 1.0 range is [0.001, 10.0]
  setRDOUASTCQualityScalar(rdo_quality: number): void;

  /**  Default is 4096, range is [64, 65535] */
  setRDOUASTCDictSize(dictSize: number): void;

  /** Default is 10.0f, range is [01, 100.0] */
  setRDOUASTCMaxAllowedRMSIncreaseRatio(rdo_uastc_max_allowed_rms_increase_ratio: number) : void;

  /** Default is 8.0f, range is [.01f, 100.0f] */
  setRDOUASTCSkipBlockRMSThresh(rdo_uastc_skip_block_rms_thresh: number) : void;

  /**
   * Sets the max # of endpoint clusters for ETC1S mode. Use instead of setQualityLevel.
   * Default is 512, range is [1, 16128]
   */
  setMaxEndpointClusters(max_endpoint_clusters: number): void;

  /**
   * Sets the max # of selectors clusters for ETC1S mode. Use instead of setQualityLevel.
   * Default is 512, range is [1, 16128]
   */
  setMaxSelectorClusters(max_selector_clusters: number): void;

  /** Default is BASISU_DEFAULT_SELECTOR_RDO_THRESH, range is [0,1e+10] */
  setSelectorRDOThresh(selector_rdo_thresh: number): void;

  /** Default is BASISU_DEFAULT_ENDPOINT_RDO_THRESH, range is [0,1e+10] */
  setEndpointRDOThresh(endpoint_rdo_thresh: number): void;

  new (): IBasisEncoder;
}

export interface IBasisModule {
  BasisEncoder: IBasisEncoder;
  initializeBasis: () => void;
}

export interface IEncodeOptions {
  /**
   *  enable debug output, default is false
   */
  enableDebug: boolean;
  /**
   * is UASTC texture, default is true
   */
  isUASTC: boolean;
  /**
   * if true the source images will be Y flipped before compression, default is false
   */
  isYFlip: boolean;
  /**
   * Sets the ETC1S encoder's quality level, which controls the file size vs. quality tradeoff.
   */
  qualityLevel: number;
  /**
   * The compression_level parameter controls the encoder perf vs. file size tradeoff for ETC1S files.
   */
  compressionLevel: number;
  /**
   * Use UASTC Zstandard supercompression. Defaults to disabled or KTX2_SS_NONE
   */
  needSupercompression: boolean;
  /**
   * setNormalMapMode is the same as the basisu.exe "-normal_map" option. It tunes several codec parameters so compression works better on normal maps.
   */
  isNormalMap: boolean;
  /**
   * Input source is sRGB. This should very probably match the "perceptual" setting.
   */
  isSetKTX2SRGBTransferFunc: boolean;
  /**
   * If true mipmaps will be generated from the source images
   */
  generateMipmap: boolean;
  /**
   * Create .KTX2 files instead of .basis files. By default this is FALSE.
   */
  isKTX2File: boolean;

  /** kv data */
  kvData: Record<string, string | Uint8Array>;

  /** type */
  type: SourceType;
  /**
   * Decode compressed image buffer to RGBA imageData.(Required in Node.js)
   * @param buffer
   * @returns
   */
  imageDecoder?: (buffer: Uint8Array) => Promise<{ width: number; height: number; data: Uint8Array }>;
}
const canvas = new OffscreenCanvas(128, 128);
const gl = canvas.getContext("webgl2", {
	premultipliedAlpha: false
});
async function webglDecode(imageBuffer : Uint8Array, resize = [512, 512]) {
	const imageBitmap = await createImageBitmap(new Blob([imageBuffer]));
	let [resizeWidth, resizeHeight] = resize;

	// Ensure dimensions are power of two (POT)
	const ensurePOT = (value : number) => {
		return Math.pow(2, Math.ceil(Math.log2(value)));
	};

	// Get the aspect ratio of the original image
	const originalWidth = imageBitmap.width;
	const originalHeight = imageBitmap.height;
	const aspectRatio = originalWidth / originalHeight;

	// Calculate the resize dimensions while preserving the aspect ratio
	if (resizeWidth / resizeHeight > aspectRatio) {
		resizeWidth = resizeHeight * aspectRatio;
	} else {
		resizeHeight = resizeWidth / aspectRatio;
	}

	// Ensure dimensions are POT (Power of Two)
	let width = ensurePOT(resizeWidth);
	let height = ensurePOT(resizeHeight);

	// Create a canvas to draw the resized image
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
    if (ctx === null || gl === null) {
        throw new Error('WebGL context is not available.');
    }
	canvas.width = width;
	canvas.height = height;

	// Draw the image to the canvas at the correct size
	ctx.drawImage(imageBitmap, 0, 0, width, height);

	// Create a WebGL texture from the canvas
	let texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

	// Set up texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// Create framebuffer
	let framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	// Read the pixels from the framebuffer
	let pixels = new Uint8Array(width * height * 4);
	gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	// Clean up resources
	gl.deleteTexture(texture);
	gl.deleteFramebuffer(framebuffer);

	return {
		data: new Uint8Array(pixels),
		width,
		height
	};
}


const DefaultOptions = {
	enableDebug: false,
	isUASTC: true,
	isKTX2File: true,
	isInputSRGB: true,
	generateMipmap: true,
	needSupercompression: true,
	isSetKTX2SRGBTransferFunc: true,
	qualityLevel: 150
};

function applyInputOptions(options : Partial<IEncodeOptions> = {}, encoder : any) {
	options = {
		...DefaultOptions,
		...options
	};
	options.enableDebug !== undefined && encoder.setDebug(options.enableDebug);
	options.isUASTC !== undefined && encoder.setUASTC(options.isUASTC);
	options.isKTX2File !== undefined && encoder.setCreateKTX2File(options.isKTX2File);
	options.isSetKTX2SRGBTransferFunc !== undefined && encoder.setKTX2SRGBTransferFunc(options.isSetKTX2SRGBTransferFunc);
	options.generateMipmap !== undefined && encoder.setMipGen(options.generateMipmap);
	options.isYFlip !== undefined && encoder.setYFlip(options.isYFlip);
	options.qualityLevel !== undefined && encoder.setQualityLevel(options.qualityLevel);
	options.compressionLevel !== undefined && encoder.setCompressionLevel(options.compressionLevel);
	options.needSupercompression !== undefined && encoder.setKTX2UASTCSupercompression(options.needSupercompression);
	options.isNormalMap !== undefined && encoder.setNormalMap(options.isNormalMap);
}
const getEncoder = async (options : Partial<IEncodeOptions> = {}) => {
    if (!encoder) {
        let basisModule = await BASIS({
            wasmBinary,
        })
        basisModule.initializeBasis();
        encoder = new basisModule.BasisEncoder();
        applyInputOptions({}, encoder);
        encoder.setTexType(0);
    }
    return encoder;
}
const basisEncode = async (encoder : IBasisEncoder,imageBuffer : Uint8Array, resize : number[]) => {
    let imageData = await webglDecode(imageBuffer, resize);
    encoder.setSliceSourceImage(
        0,
        new Uint8Array(imageData.data),
        imageData.width,
        imageData.height,
        SourceType.RAW,
    );

    const ktx2FileData = new Uint8Array(1024 * 1024 * 10);
    const byteLength = encoder.encode(ktx2FileData);
    if (byteLength === 0) {
        throw "encode failed";
    }
    let actualKTX2FileData = new Uint8Array(ktx2FileData.buffer, 0, byteLength);
    return actualKTX2FileData;
}

const textureCompressKTX2 = (options : {
    resize : number[],
    basisOptions? : Partial<IEncodeOptions>,
    resizeCustom? : { name : string, resize : number[] }[],
    // optional, default is []
} = {
    resize: [1024, 1024],
}) => {
	let fn = async (document : Document) => {
        const encoder = await getEncoder(options.basisOptions);
		document.createExtension(KHRTextureBasisu).setRequired(true);
		for (const texture of document.getRoot().listTextures()) {
			let resizePreset = options.resize;
			if (options.resizeCustom) {
				let custom = options.resizeCustom.find((item) => item.name === texture.getName());
				if (custom) {
					resizePreset = custom.resize;
				}
			}
			const image = texture.getImage();
            if (!image) {
                console.error(`Texture ${texture.getName()} has no image.`);
                continue;
            }
			let encoded = await basisEncode(encoder,image, resizePreset);
			texture.setImage(encoded);
			texture.setMimeType('image/ktx2');
			if (texture.getURI()) {
				texture.setURI(FileUtils.basename(texture.getURI()) + '.ktx2');
			}
		}
	}
	Object.defineProperty(fn, 'name', {
		value: 'textureCompressKTX2'
	});
	return fn;
}


export {textureCompressKTX2};