import { Box, Editor } from 'tldraw'
import { snapdom } from '@zumer/snapdom'
import { PreviewShape } from '../PreviewShape/PreviewShape'

/**
 * Composite iframe screenshots onto the canvas screenshot.
 * Layers (bottom to top):
 *   1. Base image (background + blank preview placeholders)
 *   2. Snapdom captures (preview iframe content)
 *   3. Transparent annotation overlay (non-preview shapes on top)
 */
export async function compositePreviewScreenshots({
	baseImageUrl,
	editor,
	selectedShapes,
	padding,
}: {
	baseImageUrl: string
	editor: Editor
	selectedShapes: PreviewShape[]
	padding: number
}): Promise<string> {
	const previews = selectedShapes.filter((s) => s.type === 'preview') as PreviewShape[]
	if (previews.length === 0) return baseImageUrl

	// Load the base canvas image
	const baseImg = await loadImage(baseImageUrl)
	const canvas = document.createElement('canvas')
	canvas.width = baseImg.width
	canvas.height = baseImg.height
	const ctx = canvas.getContext('2d')!

	// Get the bounds of the entire selection to map shape coords to image coords
	const selectionBounds = editor.getSelectionPageBounds()

	// Derive actual pixel scale from the base image dimensions
	// (accounts for both export scale and pixelRatio)
	const actualScale = baseImg.width / (selectionBounds.width + 2 * padding)

	// Capture snapdom for each preview iframe
	const previewRects: { x: number; y: number; w: number; h: number; snapCanvas: HTMLCanvasElement }[] = []

	for (const preview of previews) {
		try {
			const iframe = document.getElementById(`iframe-1-${preview.id}`) as HTMLIFrameElement
			if (!iframe?.contentDocument?.body) continue

			const snapCanvas = await snapdom.toCanvas(iframe.contentDocument.documentElement, {
				dpr: 1,
			})

			previewRects.push({
				x: (preview.x - selectionBounds.x + padding) * actualScale,
				y: (preview.y - selectionBounds.y + padding) * actualScale,
				w: preview.props.w * actualScale,
				h: preview.props.h * actualScale,
				snapCanvas,
			})
		} catch {
			// Skip if capture fails for this preview
		}
	}

	// Layer 1: Draw base image (background)
	ctx.drawImage(baseImg, 0, 0)

	// Layer 2: Draw snapdom captures over the blank preview areas
	for (const rect of previewRects) {
		const srcW = rect.snapCanvas.width
		const srcH = rect.snapCanvas.height
		ctx.drawImage(rect.snapCanvas, 0, 0, srcW, srcH, rect.x, rect.y, rect.w, rect.h)
	}

	// Layer 3: Render non-preview shapes as transparent PNG and draw on top
	const nonPreviewShapes = selectedShapes.filter((s) => s.type !== 'preview')
	if (nonPreviewShapes.length > 0) {
		try {
			const { blob: annotationBlob } = await editor.toImage(nonPreviewShapes, {
				format: 'png',
				background: false,
				padding,
				bounds: new Box(
					selectionBounds.x,
					selectionBounds.y,
					selectionBounds.width,
					selectionBounds.height
				),
			})
			if (annotationBlob) {
				const annotationUrl = await blobToDataUrl(annotationBlob)
				const annotationImg = await loadImage(annotationUrl)
				ctx.drawImage(annotationImg, 0, 0, canvas.width, canvas.height)
			}
		} catch {
			// If annotation render fails, annotations are still in the base image
		}
	}

	return canvas.toDataURL('image/jpeg', 0.85)
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = reject
		img.src = src
	})
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
}
