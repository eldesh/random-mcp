export type Locale = "en" | "ja";

export type ToolContent = {
  category: string;
  name: string;
  description: string;
  tags: string[];
};

export type LandingPageContent = {
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
  distributionTitle: string;
  distributionBody: string;
  connectLabel: string;
  connectTitle: string;
  steps: Array<{ title: string; body: string }>;
  footerDescription: string;
  licenseLabel: string;
};

export const landingPageContent: Record<Locale, LandingPageContent> = {
  en: {
    documentTitle: "random-mcp — Reliable randomness for AI agents",
    description:
      "An OAuth-protected MCP server for generating random integers, floating-point values, and choices on Cloudflare Workers.",
    languageName: "English",
    otherLanguageName: "日本語",
    eyebrow: "MCP server · Cloudflare Workers",
    title: "Reliable randomness for AI agents.",
    lead: "Move random decisions out of the language model. random-mcp generates integer and real-valued distributions, weighted choices, and repeated samples using the Web Crypto API.",
    endpointLabel: "MCP endpoint",
    endpointHint:
      "Use this URL in any OAuth-capable MCP client. GitHub OAuth identifies the user during authorization.",
    githubLabel: "View source on GitHub",
    toolsLabel: "Tools",
    toolsTitle: "A small, focused toolset",
    toolsIntroduction:
      "Three tools cover common randomization tasks. Every tool supports batched results through the count field.",
    tools: [
      {
        category: "Integer distributions",
        name: "random_int",
        description: "Generate integers from uniform, Bernoulli, binomial, or Poisson distributions.",
        tags: ["uniform", "bernoulli", "binomial", "poisson"],
      },
      {
        category: "Real-valued distributions",
        name: "random_double",
        description: "Generate floating-point values from uniform, normal, lognormal, or exponential distributions.",
        tags: ["uniform", "normal", "lognormal", "exponential"],
      },
      {
        category: "Selection",
        name: "random_choice",
        description: "Select one or more strings, with optional weights and sampling with or without replacement.",
        tags: ["weighted", "batch", "replacement"],
      },
    ],
    whyLabel: "Why random-mcp",
    whyTitle: "Language models predict. They do not draw lots.",
    whyBody:
      "A model may favor familiar-looking values when asked to choose randomly. This server performs the random operation outside the model so agents can rely on an explicit, auditable tool call.",
    qualityTitle: "Unbiased integer generation",
    qualityBody:
      "Integer generation uses rejection sampling to prevent modulo bias, so no value becomes more likely merely because the source range does not divide evenly.",
    distributionTitle: "Distributions for each task",
    distributionBody:
      "Choose uniform, Bernoulli, binomial, or Poisson distributions for integers, and uniform, normal, lognormal, or exponential distributions for real values.",
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
    description: "Cloudflare Workers上で整数、浮動小数点数、候補選択を提供する、OAuth対応の乱数生成MCPサーバーです。",
    languageName: "日本語",
    otherLanguageName: "English",
    eyebrow: "MCPサーバー · Cloudflare Workers",
    title: "AIエージェントに、\n信頼できる\n乱数を。",
    lead: "乱択を言語モデルの予測に委ねません。random-mcpはWeb Crypto APIを使用し、整数・実数の確率分布、重み付き選択、複数標本の生成をMCPツールとして提供します。",
    endpointLabel: "MCPエンドポイント",
    endpointHint:
      "このURLをOAuth対応のMCPクライアントへ登録してください。認可フローでのユーザー確認にはGitHub OAuthを使用します。",
    githubLabel: "GitHubでソースを見る",
    toolsLabel: "ツール",
    toolsTitle: "3つの乱択ツール",
    toolsIntroduction:
      "3つのツールで一般的な乱択処理を扱います。すべてのツールはcountフィールドによる複数結果の生成に対応しています。",
    tools: [
      {
        category: "整数分布",
        name: "random_int",
        description: "一様分布、ベルヌーイ分布、二項分布、ポアソン分布から整数を生成します。",
        tags: ["uniform", "bernoulli", "binomial", "poisson"],
      },
      {
        category: "実数分布",
        name: "random_double",
        description: "一様分布、正規分布、対数正規分布、指数分布から浮動小数点数を生成します。",
        tags: ["uniform", "normal", "lognormal", "exponential"],
      },
      {
        category: "候補選択",
        name: "random_choice",
        description: "候補から1つ以上を選択します。重み付け、および復元抽出・非復元抽出に対応します。",
        tags: ["weighted", "batch", "replacement"],
      },
    ],
    whyLabel: "random-mcpを使う理由",
    whyTitle: "言語モデルは予測する。\nくじは引かない。",
    whyBody:
      "モデルに無作為な選択を求めても、出力傾向によって特定の値が選ばれやすくなることがあります。このサーバーは乱択をモデルの外部で実行し、エージェントから明示的に呼び出せるツールとして提供します。",
    qualityTitle: "偏りのない整数生成",
    qualityBody:
      "整数生成では棄却法を使用して剰余バイアスを防ぎます。乱数源の範囲が指定範囲で割り切れない場合でも、一部の値だけが出やすくなることを避けます。",
    distributionTitle: "用途に合わせた確率分布",
    distributionBody:
      "整数では一様・ベルヌーイ・二項・ポアソン分布、実数では一様・正規・対数正規・指数分布を指定できます。",
    connectLabel: "接続方法",
    connectTitle: "MCPクライアントに追加",
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
