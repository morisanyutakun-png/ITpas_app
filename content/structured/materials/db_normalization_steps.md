---
slug: db_normalization_steps
type: concept_note
title: DB正規化の段階（1NF → 2NF → 3NF）
sourceFilePath: null
sourcePageNumber: null
---

| 段階 | 排除する対象 | 例 |
|---|---|---|
| **1NF** | 繰り返しグループ・複数値 | 「電話番号」列に複数の番号 → 別表へ |
| **2NF** | 主キーの**一部**にしか従属しない列 | 複合主キー(社員ID,商品ID)で「商品名」を持つ → 商品表へ |
| **3NF** | 主キー**以外**の列に従属する列（推移的従属） | 「社員ID → 部署ID → 部署名」の部署名 → 部署表へ |

## 覚え方

「**繰返し** → **部分** → **推移**」の順で排除する。
