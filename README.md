<p align="center">
    <img src="./icon.svg" alt="random-mcp icon" width="128" height="128">
</p>

# random-mcp

Cloudflare Workers 上で動作する、乱数生成用の MCP（Model Context Protocol）サーバーです。Notion Agent などの MCP クライアントから、整数・浮動小数点数・重み付き選択・各種確率分布の標本を生成できます。

## 目的

言語モデル自身に乱数を選ばせず、外部の乱数生成処理を MCP ツールとして呼び出せるようにすることを目的としています。

言語モデルに乱数の選択を委ねると、モデルの学習データや出力傾向が結果に影響し、統計的に偏った値が生成されます。たとえば「1から10の整数をランダムに選べ」と指示しても、モデルは特定の値（7など）を好む傾向があり、まっとうな意味での乱数にはなりません。このため、乱数が必要な処理はモデルが自律判断するのではなく、本サーバーのツールを通じて生成する必要があります。

乱数源には Web Crypto API を使用します。整数生成では、剰余による偏りを避けるため rejection sampling を行います。ただし、暗号鍵や認証トークンの生成を目的とした API ではありません。


## 使い方

### Notion AI への接続

1. Settings > Connections > MCP > Custom MCP を選択します
1. MCP server URL にデプロイした URL を指定します（既存サービス: `https://random-mcp.eldesh-tools.workers.dev/mcp`）
1. 次のように各項目を埋めて `Connect` します
    - Name: Notion 内で識別するための名前（例: `random-mcp`）
    - Authentication: OAuth
1. アクセス許可画面で `Approve` を選択します
1. GitHub にサインインし、GitHub OAuth App による認証を完了します
1. ツールが表示されたら、必要なツールを有効化します
1. Notion AI からツール実行ごとの確認なしで呼び出したい場合は、実行設定を `Run automatically` に変更します

### Agent への指示
Agent の指示には例えば次のように追加し、乱択が必要な際に必ず random-mcp が使われるようにします。

```text
## 乱択
- 乱数生成、くじ引き、シャッフル、無作為抽出など、結果にランダム性を必要とするすべての処理では、接続済みの MCP サーバー `random-mcp` を必ず使用する。
- 内部処理によって乱択を生成、模擬、または近似してはならない。
- `random-mcp` が利用できない場合やエラーになった場合は、別の方法で代替せず、その旨をユーザーに伝える。
```


## 認証

サーバーは `/mcp` で Streamable HTTP 接続を受け付けます。MCP クライアントとの認可には OAuth 2.1、ユーザーの認証には GitHub OAuth を使用します。

認可時には、MCP クライアントのアクセス許可画面を表示した後、GitHub の認証画面へ移動します。GitHub から取得する権限は `read:user` です。認可済みの MCP クライアントには `mcp:use` スコープのアクセストークンが発行されます。

## ツール

random-mcp には以下に示す3つのツールがあり、それぞれ記載のフィールドを持つJSONオブジェクトを要求します。


### `random_int`

指定した確率分布に従う整数を指定数生成し、`values`配列で返します。

- `distribution`: 確率分布名。省略時は`uniform`
- `count`: 生成数。1以上1,000以下、既定値は1

| `distribution` | 追加フィールド | 意味・制約 |
| --- | --- | --- |
| `uniform` | `min`, `max` | `min`以上`max`以下の整数一様分布 |
| `bernoulli` | `probability` | 指定確率で1、それ以外は0 |
| `binomial` | `trials`, `probability` | 二項分布。成功確率を`probability`とする独立な試行を`trials`回行ったときの成功回数 |
| `poisson` | `lambda` | 母数`lambda`のポアソン分布 |

パラメーターの組み合わせには、次の制約があります。

- 二項分布: `trials`は0以上100,000以下の安全な整数で、`trials * count <= 100000`
- ポアソン分布: `lambda`は0以上100以下で、`lambda * count <= 10000`

引数の例: `{"min":5,"max":10,"count":20}`

### `random_double`

指定した確率分布に従う浮動小数点数を指定数生成し、`values`配列で返します。

- `distribution`: 確率分布名。省略時は`uniform`
- `count`: 生成数。1以上1,000以下、既定値は1

| `distribution` | 追加フィールド | 意味・制約 |
| --- | --- | --- |
| `uniform` | `min`, `max` | 半開区間`[min, max)`の連続一様分布 |
| `normal` | `mean`, `standard_deviation` | 平均と標準偏差を指定した正規分布 |
| `lognormal` | `mu`, `sigma` | `log(X)`が平均`mu`、標準偏差`sigma`の正規分布に従う対数正規分布 |
| `exponential` | `rate` | 率`rate`の指数分布。`rate > 0` |

引数の例: `{"distribution":"normal","mean":0,"standard_deviation":1,"count":20}`

### `random_choice`

候補から指定数の要素を選択し、`values`配列で返します。

- `choices`: 候補文字列の配列。1個以上1,000個以下
- `weights`: 各候補の相対的な重み。省略時は等確率
- `count`: 選択数。1以上1,000以下、既定値は1
- `with_replacement`: 復元抽出では`true`、非復元抽出では`false`。既定値は`true`

`weights`を指定する場合は、`choices`と要素数を一致させ、少なくとも一つを正の値にします。
非復元抽出では、`count`を候補数以下にする必要があります。重みを指定する場合は、正の重みを持つ候補数以下にする必要もあります。

引数の例: `{"choices":["A","B","C"],"weights":[1,2,1],"count":2,"with_replacement":false}`


## 開発環境

- Node.js 22.19.0以上
- npm
- GitHub アカウント
- Cloudflare アカウント（デプロイする場合）

依存関係をインストールします。

```sh
npm install
```

## ローカル開発

### GitHub OAuth App の作成

[GitHub の Developer settings](https://github.com/settings/developers) で OAuth App を作成します。ローカル環境と本番環境ではコールバック URL が異なるため、それぞれ別の OAuth App を作成します。

ローカル開発用 OAuth App には次の値を設定します。

- Homepage URL: `http://localhost:8787`
- Authorization callback URL: `http://localhost:8787/callback`

本番用 OAuth App では、`http://localhost:8787` の部分をデプロイ先 Worker のオリジンに置き換えます。既存サービスのコールバック URL は `https://random-mcp.eldesh-tools.workers.dev/callback` です。

作成後、Client ID と Client secret を取得します。このアプリケーションが GitHub に要求する OAuth スコープは `read:user` です。

### 環境変数

プロジェクト直下に `.dev.vars` を作成します。

```dotenv
GITHUB_CLIENT_ID=<GitHub OAuth App の Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App の Client secret>
COOKIE_ENCRYPTION_KEY=<Cookie の暗号化に使用するランダムな値>
```

`COOKIE_ENCRYPTION_KEY` は、例えば次のコマンドで生成できます。

```sh
openssl rand -hex 32
```

OAuth の一時的な state は、`wrangler.jsonc` の `OAUTH_KV` バインディングで指定した Cloudflare KV に保存されます。別の Cloudflare アカウントへデプロイする場合は KV namespace を作成し、`wrangler.jsonc` の `id` をその namespace ID に置き換えてください。

### 起動

ローカルサーバーを起動します。

```sh
npm run dev
```

通常、MCP エンドポイントは次の URL になります。

```text
http://localhost:8787/mcp
```

> [!NOTE]
> Wrangler が `Request.cf` を取得できないという警告を表示しても、最後に `Ready on http://localhost:8787` と表示され、このプロジェクトが `Request.cf` を使用していなければ動作確認を続けられます。

## MCP Inspector による動作確認

ローカルサーバーを起動した状態で MCP Inspector の Web UI を起動します。

```sh
npx --yes @modelcontextprotocol/inspector@latest
```

Inspector で Streamable HTTP を選択し、接続先に `http://localhost:8787/mcp` を指定します。接続時にブラウザで OAuth の認可フローが開始されるため、アクセスを許可して GitHub 認証を完了します。本番環境を確認する場合は、接続先をデプロイ済みの MCP URL に変更します。

接続後、Tools 画面に[ツール](#ツール)で示されているものが表示されることを確認します。

## Cloudflare Workers へのデプロイ

Cloudflare へログインします。

```sh
npx wrangler login
```

本番用 GitHub OAuth App の認証情報と Cookie 暗号化キーを Cloudflare Secret として登録します。

```sh
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put COOKIE_ENCRYPTION_KEY
```

GitHub OAuth App の Authorization callback URL がデプロイ先 Worker の `/callback` を指していることと、`wrangler.jsonc` の `OAUTH_KV` が利用可能な KV namespace を指していることを確認します。

デプロイします。

```sh
npm run deploy
```

公開 URL は通常、次の形式です。

```text
https://random-mcp.<subdomain>.workers.dev/mcp
```

> [!IMPORTANT]
> `.dev.vars` は Cloudflare へ自動的には反映されません。本番 Worker は Cloudflare Secret に登録した値を参照します。

## ライセンス

[MIT License](LICENSE) の下で公開しています。
