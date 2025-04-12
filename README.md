# MMD-Shot

MMD-Shot は、Babylon.js を使用して MMD（MikuMikuDance）モデルを表示し、スクリーンショット撮影するための Web アプリケーションです。

## 特徴

- Babylon.js を使用した MMD モデルの表示
- カメラ操作によるポーズ調整
- スクリーンショット機能
- ポストプロセスエフェクト
- モーションデータの適用

## 必要条件

- Node.js 14.x 以上
- npm 6.x 以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge など）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/mmd-shot.git
cd mmd-shot

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境設定

`.env.example`ファイルをコピーして`.env`ファイルを作成し、必要に応じて設定を変更します。

```bash
cp .env.example .env
```

`.env`ファイルで設定可能な項目：

```
# MMDモデルのパス設定
VITE_MODEL_PATH=./models/your-model-file.pmx
# モーションデータのパス設定
VITE_MOTION_PATH=./motions/your-motion-file.vmd
# BGMのパス設定
VITE_BGM_PATH=./audios/your-bgm-file.mp3
```

注意: 環境変数は必ず`VITE_`プレフィックス付きで定義する必要があります。これは Vite がクライアントサイドに公開する環境変数の規約です。

## 使用方法

1. 開発サーバーを起動（`npm run dev`）
2. ブラウザで`http://localhost:5173`（または表示された URL）にアクセス
3. モデルが読み込まれたら、マウスでカメラを操作：
   - 左クリック+ドラッグ：カメラ回転
   - 右クリック+ドラッグ：カメラ移動
   - ホイール：ズームイン/アウト
4. UI ボタンを使用してスクリーンショットを撮影

## ビルド方法

```bash
# 本番用ビルド
npm run build

# ビルドファイルのプレビュー
npm run preview
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

## カスタマイズ

### モデルの変更

1. モデルファイル（.pmx）を`models`ディレクトリに配置
2. `.env`ファイルの`VITE_MODEL_PATH`を更新

### モーションの変更

1. モーションファイル（.vmd）を`motions`ディレクトリに配置
2. `.env`ファイルの`VITE_MOTION_PATH`を更新

### BGM の変更

1. 音楽ファイルを`audios`ディレクトリに配置
2. `.env`ファイルの`VITE_BGM_PATH`を更新

## 注意事項

- MMD モデルとモーションファイルの利用は、それぞれの制作者の利用規約に従ってください
- モデルデータの再配布は含まれていません。各自で合法的に取得したモデルを使用してください
- このプロジェクトは学習・非商用目的での利用を想定しています

## ライセンス

MIT License

## 謝辞

- [Babylon.js](https://www.babylonjs.com/) - 3D レンダリングエンジン
- [babylon-mmd](https://github.com/noname0310/babylon-mmd) - Babylon.js での MMD サポート
- MMD モデル・モーションの制作者様
