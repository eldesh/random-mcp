import styles from "./landing-page.css";
import template from "./landing-page.html";
import {
	landingPageContent,
	type Locale,
	type ToolContent,
} from "./landing-page-content.ts";

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function headingText(value: string): string {
	if (!value.includes("\n")) return escapeHtml(value);

	return value
		.split("\n")
		.map((phrase) => `<span class="heading-phrase">${escapeHtml(phrase)}</span>`)
		.join("<wbr>");
}

function toolCard(tool: ToolContent): string {
	const tags = tool.tags
		.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
		.join("");

	return `
		<article class="tool-card">
			<p class="tool-category">${escapeHtml(tool.category)}</p>
			<h3>${escapeHtml(tool.name)}</h3>
			<p class="tool-description">${escapeHtml(tool.description)}</p>
			<div class="tags" aria-label="Supported options">${tags}</div>
		</article>`;
}

function stepCard(step: { title: string; body: string }): string {
	return `
		<article class="step">
			<h3>${escapeHtml(step.title)}</h3>
			<p>${escapeHtml(step.body)}</p>
		</article>`;
}

function fillTemplate(values: Record<string, string>): string {
	return template.replace(/\{\{([A-Z_]+)\}\}/g, (placeholder, name: string) => {
		const value = values[name];
		if (value === undefined) {
			throw new Error(`Missing landing page template value: ${name}`);
		}
		return value;
	});
}

export function preferredLocale(acceptLanguage: string | null): Locale {
	if (acceptLanguage === null) return "en";

	const languages = acceptLanguage
		.split(",")
		.map((entry, index) => {
			const [language, ...parameters] = entry.trim().toLowerCase().split(";");
			const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
			const parsedQuality = qualityParameter === undefined
				? 1
				: Number.parseFloat(qualityParameter.trim().slice(2));

			return {
				language,
				quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
				index,
			};
		})
		.filter(({ quality }) => quality > 0)
		.sort((a, b) => b.quality - a.quality || a.index - b.index);

	for (const { language } of languages) {
		if (language === "ja" || language.startsWith("ja-")) return "ja";
		if (language === "en" || language.startsWith("en-")) return "en";
	}

	return "en";
}

export function renderLandingPage(request: Request, locale: Locale): string {
	const copy = landingPageContent[locale];
	const origin = escapeHtml(new URL(request.url).origin);
	const otherLocale: Locale = locale === "ja" ? "en" : "ja";

	return fillTemplate({
		AUTH_BODY: escapeHtml(copy.authBody),
		AUTH_TITLE: escapeHtml(copy.authTitle),
		CONNECT_LABEL: escapeHtml(copy.connectLabel),
		CONNECT_TITLE: headingText(copy.connectTitle),
		DESCRIPTION: escapeHtml(copy.description),
		DOCUMENT_TITLE: escapeHtml(copy.documentTitle),
		ENDPOINT_HINT: escapeHtml(copy.endpointHint),
		ENDPOINT_LABEL: escapeHtml(copy.endpointLabel),
		EYEBROW: escapeHtml(copy.eyebrow),
		FOOTER_DESCRIPTION: escapeHtml(copy.footerDescription),
		GITHUB_LABEL: escapeHtml(copy.githubLabel),
		LANGUAGE_NAME: escapeHtml(copy.languageName),
		LEAD: escapeHtml(copy.lead),
		LICENSE_LABEL: escapeHtml(copy.licenseLabel),
		LOCALE: locale,
		ORIGIN: origin,
		OTHER_LANGUAGE_NAME: escapeHtml(copy.otherLanguageName),
		OTHER_LOCALE: otherLocale,
		QUALITY_BODY: escapeHtml(copy.qualityBody),
		QUALITY_TITLE: escapeHtml(copy.qualityTitle),
		STEPS: copy.steps.map(stepCard).join(""),
		STYLES: styles,
		TITLE: headingText(copy.title),
		TOOLS: copy.tools.map(toolCard).join(""),
		TOOLS_INTRODUCTION: escapeHtml(copy.toolsIntroduction),
		TOOLS_LABEL: escapeHtml(copy.toolsLabel),
		TOOLS_TITLE: headingText(copy.toolsTitle),
		WHY_BODY: escapeHtml(copy.whyBody),
		WHY_LABEL: escapeHtml(copy.whyLabel),
		WHY_TITLE: headingText(copy.whyTitle),
	});
}

export function landingPageResponse(request: Request, locale: Locale): Response {
	return new Response(renderLandingPage(request, locale), {
		headers: {
			"Cache-Control": "public, max-age=300",
			"Content-Security-Policy":
				"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
			"Content-Type": "text/html; charset=utf-8",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
