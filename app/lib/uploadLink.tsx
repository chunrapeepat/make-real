'use server'

export async function uploadLink(shapeId: string, html: string): Promise<boolean> {
	if (typeof shapeId !== 'string' || !shapeId.startsWith('shape:')) {
		throw new Error('shapeId must be a string starting with shape:')
	}
	if (typeof html !== 'string') {
		throw new Error('html must be a string')
	}

	if (!process.env.POSTGRES_URL) {
		return false
	}

	const { sql } = await import('@vercel/postgres')
	shapeId = shapeId.replace(/^shape:/, '')
	await sql`INSERT INTO links (shape_id, html) VALUES (${shapeId}, ${html})`
	return true
}
