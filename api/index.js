export default async (req, res) => {
	const { reqHandler } = await import('../dist/advocacia-vetere-website/server/server.mjs');
	return reqHandler(req, res);
};
