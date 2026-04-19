---
slug: osi_layer_quickref
type: cheatsheet
title: OSI参照モデル クイックリファレンス
sourceFilePath: content/raw/references/terms_summary_02.pdf
sourcePageNumber: null
---

| 層 | 名称 | 代表プロトコル/機器 |
|---|---|---|
| 7 | アプリケーション | HTTP, SMTP, DNS, FTP |
| 6 | プレゼンテーション | 文字コード変換, 暗号化(SSL/TLSの一部) |
| 5 | セッション | 通信開始/終了の管理 |
| 4 | トランスポート | TCP, UDP |
| 3 | ネットワーク | IP, ICMP / **ルータ** |
| 2 | データリンク | Ethernet, MAC / **スイッチ, ブリッジ** |
| 1 | 物理 | ケーブル / **リピータハブ** |

## 機器の所属層 (頻出)

- **ルータ** = L3 (IPで宛先決定)
- **スイッチ/ブリッジ** = L2 (MACで宛先決定)
- **リピータハブ** = L1 (信号増幅のみ)
