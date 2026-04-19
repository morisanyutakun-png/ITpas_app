# content/raw/

ここにはアプリのデータソースとなる **元PDF** を置きます。

PDFファイル本体は `.gitignore` で除外しています（ファイルサイズが大きく、各自の手元で保管する想定です）。
構造化済みデータ (`content/structured/`) のみを Git で管理します。

## 配置ルール

```
content/raw/
├── past_exams/              # ITパスポート過去問
│   ├── r07.pdf              # 命名: r{年号2桁}[_{季}].pdf
│   ├── r06.pdf
│   ├── r05.pdf
│   ├── r02_aki.pdf
│   └── r01_aki.pdf
└── references/              # 補助資料 (用語まとめ等)
    └── terms_summary_02.pdf
```

## クローン直後にやること

```bash
mkdir -p content/raw/past_exams content/raw/references
# IPA の公開過去問PDFをダウンロードして上記の命名で配置
```

公式: https://www.ipa.go.jp/shiken/mondai-kaiotu/ip_questions.html
