# 公式サーバーのリリース手順

公式サーバーは、GitHub の `release` ブランチへの push を契機として Cloudflare 上へ自動的にデプロイされます。手元から `npm run deploy` を実行する必要はありません。

以下の操作は、特に記載がない限りリポジトリのルートディレクトリで行います。

## 開発版のバージョン

`release` ブランチではリリースしたバージョンを使用します。`master` ブランチでは、最新リリースのパッチ番号を1増やして `-dev` を付けたバージョンを使用します。たとえば、最新リリースが `2.0.0` なら、`master` ブランチのバージョンは `2.0.1-dev` です。

これにより、`master` ブランチが最新リリースより後の開発版であることを示しながら、次のリリースバージョンは未確定のままにできます。

## 1. リリースの準備

1. `master` ブランチへ移動し、リモートの最新状態を取得します。
1. 開発版バージョンを、今回リリースする安定版のバージョンへ更新します。`-dev` は取り除き、リリース内容に応じてパッチ、マイナー、またはメジャーバージョンを決定します。この値は MCP サーバーが公開するバージョンとしても使用されます。
1. 必要なテストを実行します。

```sh
git switch master
git pull origin master
npm version "<version>" --no-git-tag-version
npm test
```

バージョンの変更をコミットし、`master` ブランチを push します。

```sh
git add package.json package-lock.json
git commit -m "Release <version>"
git push origin master
```

`<version>` は実際にリリースするバージョンへ置き換えます。バージョン以外にもリリースに必要な変更がある場合は、それらが `master` ブランチへコミット済みであることを確認してください。

## 2. `release` ブランチへの反映

`release` ブランチへ移動してリモートの最新状態を取得し、`master` ブランチをマージコミットとして取り込みます。リリース単位を履歴上で明確にするため、fast-forward 可能な場合も `--no-ff` を指定します。

```sh
git switch release
git pull --ff-only origin release
git merge --no-ff master
```

マージ内容を確認してから `release` ブランチを push します。

```sh
git show
git push origin release
```

この push によって Cloudflare の自動デプロイが開始されます。

## 3. デプロイと動作の確認

1. Cloudflare のデプロイが正常に完了したことを確認します。
1. [公式サイト](https://random-mcp.eldesh-tools.workers.dev/)が表示されることを確認します。
1. MCP クライアントまたは MCP Inspector から `https://random-mcp.eldesh-tools.workers.dev/mcp` へ接続します。
1. GitHub OAuth の認可フローを完了できることを確認します。
1. 公開されているツールを実行し、期待した応答が返ることを確認します。

デプロイまたは動作確認に失敗した場合は、次の開発用バージョンへ進める前に原因を修正し、同じ手順で再度リリースします。

## 4. 次の開発バージョンへの更新

リリースの動作確認が完了したら `master` ブランチへ戻ります。

```sh
git switch master
```

今回リリースした安定版のパッチ番号を1増やして `-dev` を付けたバージョンへ更新します。

たとえば、今回のリリースが `2.1.0` なら、 `<next-version>` は `2.1.1-dev` です。

```sh
npm version "<next-version>" --no-git-tag-version
```

バージョンの変更をコミットし、`master` ブランチを push します。

```sh
git add package.json package-lock.json
git commit -m "Start next development version"
git push origin master
```