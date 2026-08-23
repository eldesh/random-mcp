import { readFile } from "node:fs/promises";

export async function load(url, context, nextLoad) {
	if (url.endsWith(".css") || url.endsWith(".html")) {
		const content = await readFile(new URL(url), "utf8");
		return {
			format: "module",
			shortCircuit: true,
			source: `export default ${JSON.stringify(content)};`,
		};
	}

	return nextLoad(url, context);
}
