# <img src="./assets/logo.png" height="25px"> 引用コメントツール

[<img src="./assets/greasyfork_badge.png" height="60px">](https://greasyfork.org/ja/scripts/446824)
[<img src="./assets/chrome_badge.png" height="60px">](https://chrome.google.com/webstore/detail/anlpocdpfdpcldkfchppmahpgpjaffan)
<img src="./assets/firefox_badge.png" height="60px">
<!-- [<img src="./assets/firefox_badge.png" height="60px">](https://addons.mozilla.org/ja/firefox/) -->

## 概要

[ニコニコアニメチャンネル](https://anime.nicovideo.jp/) と [dアニメストア ニコニコ支店](https://site.nicovideo.jp/danime/) の引用コメント関連のツールです。<br>

## インストール

- UserScript
  - [Greasy Fork](https://greasyfork.org/ja/scripts/446824)
- 拡張機能
  - [Chrome Web Store](https://chrome.google.com/webstore/detail/anlpocdpfdpcldkfchppmahpgpjaffan)
  - Firefox Add-ons (予定)
  <!-- - [Firefox Add-ons](https://addons.mozilla.org/ja/firefox/) -->

## 不具合報告・機能提案など

- Misskey ([@Midra@submarin.online](https://submarin.online/@Midra))にメンションやDM
- X ([@Midra429](https://x.com/Midra429))にメンションやDM
- GitHub > [Issues](https://github.com/Midra429/NCOverlay/issues)
- [Midraの掲示板](https://midra.me/board)
- ~~[Chrome Web Store](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe) > サポート~~<br>
  気付けない可能性高いので非推奨

---

## 開発

#### 環境

- [Visual Studio Code](https://code.visualstudio.com/)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Node.js (v18.16.1)](https://nodejs.org/ja)
- [pnpm](https://pnpm.io/ja/)

#### ビルド

```
pnpm run build
```

出力結果 (`./dist`)

```
dist/
  ├ extensions/     // 拡張機能 (非圧縮)
  ├ extensions.zip  // 拡張機能
  └ ect.user.js     // UserScript
```

#### ディレクトリ構成

```
  /
  ├ src/         // ソース
  ├ extensions/  // 拡張機能
  ├ userscript/  // UserScript
  └ env.json     // 環境変数
```

#### 環境変数

```jsonc
// ./env.json
{
  "VERSION": "4.0.0",
  "HOMEPAGE": "https://midra.me/works/extra-comment-tools"
}
```

```ts
// ./src/__env__.ts (出力結果)
export const __VERSION__ = '4.0.0'
export const __HOMEPAGE__ = 'https://midra.me/works/extra-comment-tools'
```

```ts
// 使い方
import { __VERSION__ } from '@/__env__'
```

## ライセンス

当ライセンスは [MIT](./LICENSE.txt) ライセンスの規約に基づいて付与されています。
