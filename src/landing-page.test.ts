import assert from "node:assert/strict";
import test from "node:test";
import {
	landingPageResponse,
	preferredLocale,
	renderLandingPage,
} from "./landing-page.ts";

test("preferredLocale defaults to English", () => {
	assert.equal(preferredLocale(null), "en");
	assert.equal(preferredLocale("fr-FR,fr;q=0.9"), "en");
});

test("preferredLocale respects language quality", () => {
	assert.equal(preferredLocale("ja,en;q=0.8"), "ja");
	assert.equal(preferredLocale("ja;q=0.5,en-US;q=0.9"), "en");
	assert.equal(preferredLocale("fr-FR,ja;q=0.8,en;q=0.7"), "ja");
});

test("renderLandingPage renders the current toolset and request origin", () => {
	const html = renderLandingPage(
		new Request("https://example.com/ja/"),
		"ja",
	);

	assert.match(html, /<html lang="ja">/);
	assert.match(
		html,
		/https:\/\/example\.com\/<span class="endpoint-path">mcp<\/span>/,
	);
	assert.match(html, /random_int/);
	assert.match(html, /random_double/);
	assert.match(html, /random_choice/);
	assert.doesNotMatch(html, /random_sample/);
	assert.match(html, /<style>:root \{/);
	assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
	assert.match(
		html,
		/<section class="section shell" id="tools">[\s\S]*?<h2>3つの乱択ツール<\/h2>/,
	);
	assert.match(html, /<h2>MCPクライアントに追加<\/h2>/);
	assert.equal(
		(html.match(/href="https:\/\/github\.com\/eldesh\/random-mcp[^\"]*" target="_blank" rel="noopener noreferrer"/g) ?? []).length,
		3,
	);
});

test("landingPageResponse supplies HTML security headers", async () => {
	const response = landingPageResponse(
		new Request("https://example.com/en/"),
		"en",
	);

	assert.equal(response.status, 200);
	assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
	assert.match(response.headers.get("Content-Security-Policy") ?? "", /default-src 'none'/);
	const html = await response.text();
	assert.match(html, /Reliable randomness for AI agents/);
	assert.doesNotMatch(
		html,
		/<span class="heading-phrase">Reliable randomness for AI agents\.<\/span>/,
	);
});
