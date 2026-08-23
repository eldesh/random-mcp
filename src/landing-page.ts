type Locale = "en" | "ja";

type ToolContent = {
	category: string;
	name: string;
	description: string;
	tags: string[];
};

type LandingPageContent = {
	documentTitle: string;
	description: string;
	languageName: string;
	otherLanguageName: string;
	eyebrow: string;
	title: string;
	lead: string;
	endpointLabel: string;
	endpointHint: string;
	githubLabel: string;
	toolsLabel: string;
	toolsTitle: string;
	toolsIntroduction: string;
	tools: ToolContent[];
	whyLabel: string;
	whyTitle: string;
	whyBody: string;
	qualityTitle: string;
	qualityBody: string;
	authTitle: string;
	authBody: string;
	connectLabel: string;
	connectTitle: string;
	steps: Array<{ title: string; body: string }>;
	footerDescription: string;
	licenseLabel: string;
};

const content: Record<Locale, LandingPageContent> = {
	en: {
		documentTitle: "random-mcp — Reliable randomness for AI agents",
		description:
			"An OAuth-protected MCP server for generating random integers, floating-point values, and choices on Cloudflare Workers.",
		languageName: "English",
		otherLanguageName: "日本語",
		eyebrow: "MCP server · Cloudflare Workers",
		title: "Reliable randomness for AI agents.",
		lead:
			"Move random decisions out of the language model. random-mcp generates integer and real-valued distributions, weighted choices, and repeated samples using the Web Crypto API.",
		endpointLabel: "MCP endpoint",
		endpointHint: "Use this URL in any OAuth-capable MCP client.",
		githubLabel: "View source on GitHub",
		toolsLabel: "Tools",
		toolsTitle: "A small, focused toolset",
		toolsIntroduction:
			"Three tools cover common randomization tasks. Every tool supports batched results through the count field.",
		tools: [
			{
				category: "Integer distributions",
				name: "random_int",
				description:
					"Generate integers from uniform, Bernoulli, binomial, or Poisson distributions.",
				tags: ["uniform", "bernoulli", "binomial", "poisson"],
			},
			{
				category: "Real-valued distributions",
				name: "random_double",
				description:
					"Generate floating-point values from uniform, normal, lognormal, or exponential distributions.",
				tags: ["uniform", "normal", "lognormal", "exponential"],
			},
			{
				category: "Selection",
				name: "random_choice",
				description:
					"Select one or more strings, with optional weights and sampling with or without replacement.",
				tags: ["weighted", "batch", "replacement"],
			},
		],
		whyLabel: "Why random-mcp",
		whyTitle: "Language models predict. They do not draw lots.",
		whyBody:
			"A model may favor familiar-looking values when asked to choose randomly. This server performs the random operation outside the model so agents can rely on an explicit, auditable tool call.",
		qualityTitle: "Unbiased integer ranges",
		qualityBody:
			"Integer generation uses rejection sampling to prevent modulo bias, so no value becomes more likely merely because the source range does not divide evenly.",
		authTitle: "OAuth-protected access",
		authBody:
			"MCP clients receive an OAuth 2.1 access token after user consent. GitHub OAuth is used to identify the user during that authorization flow.",
		connectLabel: "Connect",
		connectTitle: "Add it to an MCP client",
		steps: [
			{
				title: "Add a custom MCP server",
				body: "Open your client's MCP connection settings and choose a custom Streamable HTTP server.",
			},
			{
				title: "Enter the endpoint",
				body: "Use the MCP endpoint shown above and select OAuth as the authentication method.",
			},
			{
				title: "Approve and sign in",
				body: "Approve the requested access, complete GitHub sign-in, and enable the tools you want to use.",
			},
		],
		footerDescription: "Open-source randomization tools for MCP clients.",
		licenseLabel: "MIT License",
	},
	ja: {
		documentTitle: "random-mcp — AIエージェントのための信頼できる乱数",
		description:
			"Cloudflare Workers上で整数、浮動小数点数、候補選択を提供する、OAuth対応の乱数生成MCPサーバーです。",
		languageName: "日本語",
		otherLanguageName: "English",
		eyebrow: "MCPサーバー · Cloudflare Workers",
		title: "AIエージェントに、信頼できる乱数を。",
		lead:
			"乱択を言語モデルの予測に委ねません。random-mcpはWeb Crypto APIを使用し、整数・実数の確率分布、重み付き選択、複数標本の生成をMCPツールとして提供します。",
		endpointLabel: "MCPエンドポイント",
		endpointHint: "OAuthに対応したMCPクライアントへ、このURLを登録してください。",
		githubLabel: "GitHubでソースを見る",
		toolsLabel: "ツール",
		toolsTitle: "小さく、目的の明確なツールセット",
		toolsIntroduction:
			"3つのツールで一般的な乱択処理を扱います。すべてのツールはcountフィールドによる複数結果の生成に対応しています。",
		tools: [
			{
				category: "整数分布",
				name: "random_int",
				description:
					"一様分布、ベルヌーイ分布、二項分布、ポアソン分布から整数を生成します。",
				tags: ["uniform", "bernoulli", "binomial", "poisson"],
			},
			{
				category: "実数分布",
				name: "random_double",
				description:
					"一様分布、正規分布、対数正規分布、指数分布から浮動小数点数を生成します。",
				tags: ["uniform", "normal", "lognormal", "exponential"],
			},
			{
				category: "候補選択",
				name: "random_choice",
				description:
					"候補から1つ以上を選択します。重み付け、および復元抽出・非復元抽出に対応します。",
				tags: ["weighted", "batch", "replacement"],
			},
		],
		whyLabel: "random-mcpを使う理由",
		whyTitle: "言語モデルは予測します。くじを引くわけではありません。",
		whyBody:
			"モデルに無作為な選択を求めても、出力傾向によって特定の値が選ばれやすくなることがあります。このサーバーは乱択をモデルの外部で実行し、エージェントから明示的に呼び出せるツールとして提供します。",
		qualityTitle: "偏りのない整数範囲",
		qualityBody:
			"整数生成では棄却法を使用して剰余バイアスを防ぎます。乱数源の範囲が指定範囲で割り切れない場合でも、一部の値だけが出やすくなることを避けます。",
		authTitle: "OAuthで保護されたアクセス",
		authBody:
			"ユーザーが許可すると、MCPクライアントへOAuth 2.1アクセストークンを発行します。その認可手続きでユーザーを確認するため、GitHub OAuthを使用します。",
		connectLabel: "接続方法",
		connectTitle: "MCPクライアントへ追加する",
		steps: [
			{
				title: "カスタムMCPサーバーを追加",
				body: "クライアントのMCP接続設定を開き、カスタムのStreamable HTTPサーバーを選択します。",
			},
			{
				title: "エンドポイントを入力",
				body: "上記のMCPエンドポイントを指定し、認証方法としてOAuthを選択します。",
			},
			{
				title: "許可してサインイン",
				body: "アクセスを許可し、GitHubへのサインインを完了して、使用するツールを有効化します。",
			},
		],
		footerDescription: "MCPクライアントのためのオープンソース乱択ツール。",
		licenseLabel: "MIT License",
	},
};

const styles = String.raw`
	:root {
		color-scheme: light dark;
		--background: #f4f1ea;
		--surface: rgba(255, 255, 255, 0.72);
		--surface-strong: #fffdf8;
		--text: #18211b;
		--muted: #5d675f;
		--line: rgba(24, 33, 27, 0.15);
		--accent: #176b45;
		--accent-soft: #dcecdf;
		--code: #10271c;
		--code-text: #d9f7e5;
		--shadow: 0 24px 70px rgba(40, 48, 42, 0.08);
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		font-synthesis: none;
	}

	* { box-sizing: border-box; }

	html { scroll-behavior: smooth; }

	body {
		margin: 0;
		background:
			radial-gradient(circle at 10% 0%, rgba(35, 132, 86, 0.13), transparent 28rem),
			linear-gradient(180deg, #f8f6f0 0%, var(--background) 100%);
		color: var(--text);
		line-height: 1.65;
	}

	a { color: inherit; }
	a:focus-visible { outline: 3px solid #5da97f; outline-offset: 4px; }

	.shell {
		width: min(1280px, calc(100% - 48px));
		margin-inline: auto;
	}

	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 88px;
		border-bottom: 1px solid var(--line);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		font: 700 1rem/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		text-decoration: none;
	}

	.brand img { width: 38px; height: 38px; }

	.language-switch {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font-size: 0.875rem;
		color: var(--muted);
	}

	.language-switch a { text-underline-offset: 4px; }
	.language-switch [aria-current="page"] { color: var(--text); font-weight: 700; text-decoration: none; }

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.8fr);
		gap: clamp(48px, 8vw, 112px);
		align-items: end;
		padding-block: clamp(80px, 11vw, 156px) clamp(72px, 9vw, 120px);
	}

	.eyebrow, .section-label, .tool-category {
		margin: 0 0 18px;
		color: var(--accent);
		font-size: 0.76rem;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	h1 {
		max-width: 900px;
		margin: 0;
		font-size: clamp(3.15rem, 7vw, 7.4rem);
		font-weight: 750;
		letter-spacing: -0.065em;
		line-height: 0.94;
	}

	.lead {
		max-width: 72ch;
		margin: 32px 0 0;
		color: var(--muted);
		font-size: clamp(1.08rem, 1.6vw, 1.3rem);
	}

	.endpoint-card {
		padding: 26px;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: var(--surface);
		box-shadow: var(--shadow);
		backdrop-filter: blur(12px);
	}

	.endpoint-label { display: block; margin-bottom: 10px; color: var(--muted); font-size: 0.8rem; font-weight: 700; }

	.endpoint {
		display: block;
		overflow-wrap: anywhere;
		padding: 14px 16px;
		border-radius: 10px;
		background: var(--code);
		color: var(--code-text);
		font: 600 0.88rem/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	}

	.endpoint-hint { margin: 14px 0 22px; color: var(--muted); font-size: 0.9rem; }

	.text-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 750;
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
	}

	.section { padding-block: clamp(72px, 9vw, 120px); border-top: 1px solid var(--line); }

	.section-heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(280px, 0.65fr);
		gap: 48px;
		align-items: end;
		margin-bottom: 46px;
	}

	h2 {
		max-width: 820px;
		margin: 0;
		font-size: clamp(2.25rem, 4.4vw, 4.7rem);
		letter-spacing: -0.05em;
		line-height: 1;
	}

	.section-introduction { max-width: 58ch; margin: 0; color: var(--muted); font-size: 1.03rem; }

	.tool-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
	}

	.tool-card {
		display: flex;
		min-height: 310px;
		flex-direction: column;
		padding: clamp(24px, 3vw, 34px);
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--surface-strong);
	}

	.tool-card h3 {
		margin: 0;
		font: 750 clamp(1.25rem, 2vw, 1.55rem)/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		letter-spacing: -0.03em;
	}

	.tool-description { margin: 25px 0 32px; color: var(--muted); }

	.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }

	.tag {
		padding: 5px 9px;
		border-radius: 999px;
		background: var(--accent-soft);
		color: #174d35;
		font: 650 0.72rem/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	}

	.reason-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) repeat(2, minmax(250px, 0.7fr));
		gap: 18px;
	}

	.reason-main, .reason-card { padding: clamp(28px, 4vw, 46px); border-radius: 16px; }
	.reason-main { background: var(--code); color: #edf8f1; }
	.reason-card { border: 1px solid var(--line); background: var(--surface); }
	.reason-main h2 { font-size: clamp(2.2rem, 3.8vw, 4rem); }
	.reason-main p { max-width: 60ch; margin: 28px 0 0; color: #bcd0c3; }
	.reason-card h3 { margin: 0 0 18px; font-size: 1.25rem; }
	.reason-card p { margin: 0; color: var(--muted); }

	.steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px; counter-reset: steps; }
	.step { counter-increment: steps; padding-top: 24px; border-top: 2px solid var(--text); }
	.step::before { content: "0" counter(steps); display: block; margin-bottom: 34px; color: var(--accent); font: 750 0.85rem/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
	.step h3 { margin: 0 0 12px; font-size: 1.2rem; }
	.step p { max-width: 42ch; margin: 0; color: var(--muted); }

	.site-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding-block: 38px;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.88rem;
	}

	.footer-links { display: flex; gap: 22px; }
	.footer-links a { text-underline-offset: 4px; }

	@media (max-width: 960px) {
		.hero, .section-heading { grid-template-columns: 1fr; }
		.endpoint-card { max-width: 620px; }
		.tool-grid, .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.reason-grid { grid-template-columns: 1fr 1fr; }
		.reason-main { grid-column: 1 / -1; }
	}

	@media (max-width: 640px) {
		.shell { width: min(100% - 28px, 1280px); }
		.site-header { min-height: 72px; }
		.language-switch span { display: none; }
		.hero { padding-block: 64px 74px; gap: 38px; }
		h1 { font-size: clamp(2.8rem, 15vw, 4.5rem); }
		.section { padding-block: 70px; }
		.section-heading { gap: 24px; }
		.tool-grid, .reason-grid, .steps { grid-template-columns: 1fr; }
		.reason-main { grid-column: auto; }
		.tool-card { min-height: 270px; }
		.site-footer { align-items: flex-start; flex-direction: column; }
	}

	@media (prefers-reduced-motion: reduce) {
		html { scroll-behavior: auto; }
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--background: #101712;
			--surface: rgba(25, 36, 29, 0.76);
			--surface-strong: #18221b;
			--text: #edf4ef;
			--muted: #a9b5ac;
			--line: rgba(232, 244, 236, 0.15);
			--accent: #79d5a4;
			--accent-soft: #214432;
			--code: #07150d;
			--code-text: #d9f7e5;
			--shadow: none;
		}
		body { background: radial-gradient(circle at 10% 0%, rgba(35, 132, 86, 0.2), transparent 28rem), var(--background); }
		.tag { color: #bce9ce; }
	}
`;

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
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
	const copy = content[locale];
	const origin = new URL(request.url).origin;
	const escapedOrigin = escapeHtml(origin);
	const endpoint = `${origin}/mcp`;
	const otherLocale: Locale = locale === "ja" ? "en" : "ja";
	const tools = copy.tools.map(toolCard).join("");
	const steps = copy.steps.map(stepCard).join("");

	return `<!doctype html>
<html lang="${locale}">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(copy.documentTitle)}</title>
	<meta name="description" content="${escapeHtml(copy.description)}">
	<meta name="theme-color" content="#10271c">
	<link rel="icon" href="/icon.svg" type="image/svg+xml">
	<link rel="canonical" href="${escapedOrigin}/${locale}/">
	<link rel="alternate" hreflang="ja" href="${escapedOrigin}/ja/">
	<link rel="alternate" hreflang="en" href="${escapedOrigin}/en/">
	<link rel="alternate" hreflang="x-default" href="${escapedOrigin}/">
	<style>${styles}</style>
</head>
<body>
	<header class="site-header shell">
		<a class="brand" href="/${locale}/" aria-label="random-mcp home">
			<img src="/icon.svg" alt="" width="38" height="38">
			<span>random-mcp</span>
		</a>
		<nav class="language-switch" aria-label="Language">
			<a href="/${locale}/" lang="${locale}" aria-current="page">${escapeHtml(copy.languageName)}</a>
			<span aria-hidden="true">/</span>
			<a href="/${otherLocale}/" lang="${otherLocale}">${escapeHtml(copy.otherLanguageName)}</a>
		</nav>
	</header>

	<main>
		<section class="hero shell">
			<div>
				<p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
				<h1>${escapeHtml(copy.title)}</h1>
				<p class="lead">${escapeHtml(copy.lead)}</p>
			</div>
			<aside class="endpoint-card">
				<span class="endpoint-label">${escapeHtml(copy.endpointLabel)}</span>
				<code class="endpoint">${escapeHtml(endpoint)}</code>
				<p class="endpoint-hint">${escapeHtml(copy.endpointHint)}</p>
				<a class="text-link" href="https://github.com/eldesh/random-mcp">${escapeHtml(copy.githubLabel)} <span aria-hidden="true">↗</span></a>
			</aside>
		</section>

		<section class="section shell" id="tools">
			<div class="section-heading">
				<div>
					<p class="section-label">${escapeHtml(copy.toolsLabel)}</p>
					<h2>${escapeHtml(copy.toolsTitle)}</h2>
				</div>
				<p class="section-introduction">${escapeHtml(copy.toolsIntroduction)}</p>
			</div>
			<div class="tool-grid">${tools}
			</div>
		</section>

		<section class="section shell" id="why">
			<div class="reason-grid">
				<article class="reason-main">
					<p class="section-label">${escapeHtml(copy.whyLabel)}</p>
					<h2>${escapeHtml(copy.whyTitle)}</h2>
					<p>${escapeHtml(copy.whyBody)}</p>
				</article>
				<article class="reason-card">
					<h3>${escapeHtml(copy.qualityTitle)}</h3>
					<p>${escapeHtml(copy.qualityBody)}</p>
				</article>
				<article class="reason-card">
					<h3>${escapeHtml(copy.authTitle)}</h3>
					<p>${escapeHtml(copy.authBody)}</p>
				</article>
			</div>
		</section>

		<section class="section shell" id="connect">
			<div class="section-heading">
				<div>
					<p class="section-label">${escapeHtml(copy.connectLabel)}</p>
					<h2>${escapeHtml(copy.connectTitle)}</h2>
				</div>
			</div>
			<div class="steps">${steps}
			</div>
		</section>
	</main>

	<footer class="site-footer shell">
		<span>${escapeHtml(copy.footerDescription)}</span>
		<nav class="footer-links" aria-label="Footer">
			<a href="https://github.com/eldesh/random-mcp">GitHub</a>
			<a href="https://github.com/eldesh/random-mcp/blob/master/LICENSE">${escapeHtml(copy.licenseLabel)}</a>
		</nav>
	</footer>
</body>
</html>`;
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
