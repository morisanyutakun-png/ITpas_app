---
slug: authn_vs_authz_table
type: term_compare
title: 認証(AuthN)と認可(AuthZ)の比較表
sourceFilePath: content/raw/references/terms_summary_02.pdf
sourcePageNumber: null
---

| 観点 | 認証 (AuthN) | 認可 (AuthZ) |
|---|---|---|
| 問い | あなたは誰か？ | あなたは何をしてよいか？ |
| 例 | パスワード/指紋/SMSコード | ロール割当/ACL/権限ポリシー |
| 順序 | 先 | 後 |
| 失敗の例 | パスワード間違い | 「閲覧はできるが編集はできない」 |
| 関連語 | 多要素認証, SSO, FIDO | RBAC, ABAC, スコープ |

## ひっかけ警報

- 「多要素認証で**権限**を付与する」 → ✗ 多要素認証はAuthN
- 「SSOで**何ができるか**が決まる」 → ✗ SSOはAuthN効率化
