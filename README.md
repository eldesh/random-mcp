# random-mcp

Cloudflare Workers 上で動作する、乱数生成用の MCP（Model Context Protocol）サーバーです。Notion Agent などの MCP クライアントから、整数・浮動小数点数・重み付き選択・各種確率分布の標本を生成できます。

## 目的

言語モデル自身に乱数を選ばせず、外部の乱数生成処理を MCP ツールとして呼び出せるようにすることを目的としています。

言語モデルに乱数の選択を委ねると、モデルの学習データや出力傾向が結果に影響し、統計的に偏った値が生成されます。たとえば「1から10の整数をランダムに選べ」と指示しても、モデルは特定の値（7など）を好む傾向があり、まっとうな意味での乱数にはなりません。このため、乱数が必要な処理はモデルが自律判断するのではなく、本サーバーのツールを通じて生成する必要があります。

乱数源には Web Crypto API を使用します。整数生成では、剰余による偏りを避けるため rejection sampling を行います。ただし、暗号鍵や認証トークンの生成を目的とした API ではありません。


## Notion AIへの接続

1. Settings > Connections > MCP > Custom MCP を選択します
1. MCP server URL にデプロイしたURLを指定します(既存サービス: https://random-mcp.eldesh-tools.workers.dev/mcp)
1. 次のように各項目を埋めます
    - Name: Notion内で識別するための名前 (例: random-mcp)
    - Authentication: Bearer token
    - Prefix: Bearer
    - Token: .prd.vars に書いたMCP_TOKEN
1. ツールが表示されたら、必要なツールを有効化します
1. 承認なしで呼び出す場合は、実行設定を`Run automatically`に変更します

## Agent への指示
Agentの指示には例えば次のように追加し、乱択が必要な際に必ず random-mcp が使われるようにします。

```text
## 乱択
- 乱数生成、くじ引き、シャッフル、無作為抽出など、結果にランダム性を必要とするすべての処理では、接続済みの MCP サーバー `random-mcp` を必ず使用する。
- 内部処理によって乱択を生成、模擬、または近似してはならない。
- `random-mcp` が利用できない場合やエラーになった場合は、別の方法で代替せず、その旨をユーザーに伝える。
```


## 機能

サーバーは `/mcp` で Streamable HTTP 接続を受け付け、Bearer トークンで認証します。

### `random_int`

指定範囲内の整数を1個生成します。

- `min`: 最小値
- `max`: 最大値

### `random_double`

指定範囲内の浮動小数点数を1個生成します。

- `min`: 最小値
- `max`: 最大値

### `random_choice`

候補から1要素を選択します。

- `choices`: 候補文字列の配列。1個以上1,000個以下
- `weights`: 各候補の相対的な重み。省略時は等確率

`weights`を指定する場合は、`choices`と要素数を一致させ、少なくとも一つを正の値にします。

### `random_sample`

指定した確率分布から複数の標本を生成します。

- `distribution`: 確率分布名
- `parameters`: 分布ごとのパラメーターを与えるフィールド名
- `count`: 標本数。1以上100以下、既定値は1

| `distribution` | `parameters` | 意味・制約 |
| --- | --- | --- |
| `uniform` | `min`, `max` | `min`から`max`までの連続一様分布 |
| `normal` | `mean`, `standard_deviation` | 平均と標準偏差を指定した正規分布 |
| `lognormal` | `mu`, `sigma` | `log(X)`が平均`mu`、標準偏差`sigma`の正規分布に従う対数正規分布 |
| `exponential` | `rate` | 率`rate`の指数分布。`rate > 0` |
| `bernoulli` | `probability` | 指定確率で1、それ以外は0 |
| `binomial` | `trials`, `probability` | `trials`回の試行における成功回数 |
| `poisson` | `lambda` | 母数`lambda`のポアソン分布 |

追加の計算量制限があります。

- 二項分布: `trials`は0以上100,000以下の安全な整数で、`trials * count <= 100000`
- ポアソン分布: `lambda`は0以上100以下で、`lambda * count <= 10000`

## 開発環境

- Node.js 22.19.0以上
- npm
- GNU Make
- GNU m4
- Cloudflareアカウント（デプロイする場合）

依存関係をインストールします。

```sh
npm install
```

## ローカル開発

プロジェクト直下に`.dev.vars`を作成します。

```dotenv
MCP_TOKEN=<ローカル開発用トークン>
GITHUB_CLIENT_ID=<GitHub OAuth App の Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App の Client secret>
# 任意: 許可するアカウントを制限する場合
# GITHUB_ALLOWED_LOGIN=<許可する GitHub ログイン名>
# GITHUB_ALLOWED_ID=<許可する GitHub ユーザーID>
```

トークンは、例えば次のコマンドで生成できます。

```sh
openssl rand -hex 32
```

ローカルサーバーを起動します。

```sh
npm run dev
```

通常、MCPエンドポイントは次のURLになります。

```text
http://localhost:8787/mcp
```

> [INFO!]
> Wranglerが`Request.cf`を取得できないという警告を表示しても、最後に`Ready on http://localhost:8787`と表示され、このプロジェクトが`Request.cf`を使用していなければ動作確認を続けられます。

## MCP-Inspectorの接続

MCP-Inspectorでレスポンスを確認するための設定ファイルを生成できます。

```sh
make inspector-dev
make inspector-prd
```

これらのターゲットはそれぞれ`.dev.vars`または`.prd.vars`を読み込み、ローカルMCPサーバまたはデプロイ済みMCPサーバに接続するためのファイルを生成します。

対応関係は次のとおりです。

| Makeターゲット | 変数ファイル | 生成物 |
| --- | --- | --- |
| `inspector-dev` | `.dev.vars` | `inspector.dev.json` |
| `inspector-prd` | `.prd.vars` | `inspector.prd.json` |

本番用設定を生成する場合は、Makefileで`inspector.prd.json`に割り当てる`MCP_URL`を実際の公開URLへ変更し、`.prd.vars`に本番用の`MCP_TOKEN`を設定します。

## MCP Inspectorによる動作確認

### ツール一覧

ローカルサーバーを起動した状態で、次を実行します。

```sh
npx --yes @modelcontextprotocol/inspector@latest \
  --cli \
  --config ./inspector.dev.json \
  --server random-mcp \
  --method tools/list
```

次の4ツールが表示されることを確認します。

- `random_int`
- `random_double`
- `random_choice`
- `random_sample`

### `random_choice`

```sh
npx --yes @modelcontextprotocol/inspector@latest \
  --cli \
  --config ./inspector.dev.json \
  --server random-mcp \
  --method tools/call \
  --tool-name random_choice \
  --tool-args-json '{"choices":["A","B","C"],"weights":[1,2,1]}'
```

### `random_sample`

```sh
npx --yes @modelcontextprotocol/inspector@latest \
  --cli \
  --config ./inspector.dev.json \
  --server random-mcp \
  --method tools/call \
  --tool-name random_sample \
  --tool-args-json '{"distribution":"uniform","parameters":{"min":5,"max":15},"count":3}'
```

> [INFO!]
> Inspector Webの入力フォームでは、配列やオブジェクトが文字列として送信される場合があります。その場合は、上記のようにCLIの`--tool-args-json`を使用します。

## Cloudflare Workersへのデプロイ

Cloudflareへログインします。

```sh
npx wrangler login
```

本番用トークンをCloudflare Secretとして登録します。

```sh
npx wrangler secret put MCP_TOKEN
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

必要に応じて、認可可能なGitHubアカウントを固定するSecretも登録します。

```sh
npx wrangler secret put GITHUB_ALLOWED_LOGIN
npx wrangler secret put GITHUB_ALLOWED_ID
```

デプロイします。

```sh
npm run deploy
```

公開URLは通常、次の形式です。

```text
https://random-mcp.<subdomain>.workers.dev/mcp
```

> [INFO!]
> `.dev.vars`と`.prd.vars`はCloudflareへ自動的には反映されません。本番WorkerはCloudflare Secretの`MCP_TOKEN`を参照します。

## ライセンス

ライセンスは未指定です。公開または再配布する場合は、目的に応じたライセンスを追加してください。
