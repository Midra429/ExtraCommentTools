# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> 引用コメントツール
[![GitHub Release](https://img.shields.io/github/v/release/Midra429/ExtraCommentTools?label=Releases)](https://github.com/Midra429/ExtraCommentTools/releases/latest)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/anlpocdpfdpcldkfchppmahpgpjaffan?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/anlpocdpfdpcldkfchppmahpgpjaffan)
[![Firefox Add-ons](https://img.shields.io/amo/v/引用コメントツール?label=Firefox%20Add-ons)](https://addons.mozilla.org/ja/firefox/addon/引用コメントツール/)

[<img src="assets/badges/chrome.png" height="60px">](https://chromewebstore.google.com/detail/anlpocdpfdpcldkfchppmahpgpjaffan)
[<img src="assets/badges/firefox.png" height="60px">](https://addons.mozilla.org/ja/firefox/addon/引用コメントツール/)

## 概要
ニコニコ動画の引用コメント関連のツールです。

## 機能
- 引用コメントを表示 / 非表示
- 引用コメントを重ならないように表示
- 引用コメントを半透明化 / 半透明を解除
- 引用コメントの色をカスタマイズ
- かんたんコメントを表示 / 非表示
- コメントアシストの表示を抑制
- 引用コメントの自動検索
- コメントの手動引用

## インストール
### Chrome Web Store
https://chromewebstore.google.com/detail/anlpocdpfdpcldkfchppmahpgpjaffan

### Firefox Add-ons
https://addons.mozilla.org/ja/firefox/addon/引用コメントツール/

## 不具合報告・機能提案など
- [Google フォーム](https://docs.google.com/forms/d/e/1FAIpQLSdKaAMiPx0T-kiM49g9X0Knu9JGR77VBtSU2BCE6xBwELkP8g/viewform)<br>
(引用コメントツール経由でアクセスすると、バージョンやOSなどの情報が自動入力されます)
- GitHubの[Issues](https://github.com/Midra429/ExtraCommentTools/issues)
- SNSアカウント宛にメッセージやメンション
  - X (Twitter): [@Midra429](https://x.com/Midra429)

---

## 開発
### 環境
- [bun](https://bun.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Chrome](https://www.google.com/intl/ja/chrome/)

### 開発サーバー
```sh
# Chrome
bun run dev
```
```sh
# Firefox
bun run dev:firefox
```

### 出力
```sh
# dist/chrome-mv3
bun run build
```
```sh
# dist/firefox-mv3
bun run build:firefox
```

### 出力 (ZIP)
```sh
# dist/extra-comment-tools-0.0.0-chrome.zip
bun run zip
```
```sh
# dist/extra-comment-tools-0.0.0-firefox.zip
# dist/extra-comment-tools-0.0.0-sources.zip
bun run zip:firefox
```

## ライブラリ
- **nco-utils**<br>
[GitHub](https://github.com/Midra429/nco-utils) / [npm](https://www.npmjs.com/package/@midra/nco-utils)<br>
NCOverlay用のユーティリティライブラリ

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
