# MMD-Shot 💫

MMD-Shot は、Babylon.js + babylon-mmd を使用して MMD（MikuMikuDance）モデルのダンスを高品質にレンダリングし、好きな瞬間を写真として撮影できる Electron アプリケーションです。

<img width="495" alt="image" src="https://github.com/user-attachments/assets/fb442126-8b69-4027-8d02-c4d85f7c5f24" />

## 特徴

- **高品質レンダリング**: Babylon.js 9 + babylon-mmd 1.2 による MMD トゥーン描画 (SDEF スキニング / アウトライン / 高解像度シャドウ / Retina 対応)
- **エフェクトプリセット**: Ray-MMD 風の「リッチ」(ブルーム / 被写界深度 / SSAO / ACES トーンマッピング / グロー) と「クラシック MMD」をワンタップ切替
- **カメラモード**:
  - カメラ VMD 再生 (`cameras/` にカメラモーションを配置すると有効化)
  - 自動カメラ (ショット自動切替・ズーム・オービットを生成。カメラ VMD がなくても MV 風の画に)
  - 手動カメラ (顔追従 / 全身、マウス操作)
- **ステージ**: ビルトインのネオンステージ (光沢床の反射付き) / ユーザー所有のステージ PMX の読み込み
- **高解像度撮影**: ポストエフェクト込みで表示解像度の 3 倍 (最大 4096px) の PNG を保存
- **アセット選択 UI**: アプリ内でモデル / モーション / カメラ / ステージ / 音楽を切り替え
- **物理演算**: Bullet (WASM) による MMD 標準 (重力 -98) の髪・スカート物理
- クロスプラットフォーム対応（macOS・Windows）

## 必要条件

- Node.js 18.x 以上
- npm 9.x 以上
- ビルド環境（macOS 向けビルドは macOS で、Windows 向けビルドは Windows で行う必要があります）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/kokushin/mmd-shot.git
cd mmd-shot

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境設定

`.env.example`ファイルをコピーして`.env`ファイルを作成し、設定を変更します。

```bash
cp .env.example .env
```

`.env`ファイルで設定可能な項目：

```
# MMDモデルのパス設定 (必須)
VITE_MODEL_PATH=./models/your-model-file.pmx
# モーションデータのパス設定 (必須)
VITE_MOTION_PATH=./motions/your-motion-file.vmd
# BGMのパス設定 (空欄で無音)
VITE_BGM_PATH=./audios/your-bgm-file.mp3
# カメラモーションVMDのパス設定 (空欄でカメラVMDモード無効)
VITE_CAMERA_PATH=
# ステージPMXのパス設定 (空欄でビルトインステージ)
VITE_STAGE_PATH=
```

注意: 環境変数は必ず`VITE_`プレフィックス付きで定義する必要があります。これは Vite がクライアントサイドに公開する環境変数の規約です。

## 使用方法

1. 開発サーバーを起動（`npm run dev`）すると Electron アプリケーションが自動的に起動します
2. 画面下部の UI で操作：
   - **📷 ボタン (右下)**: カメラモード切替 (カメラ VMD → 自動 → 顔追従 → 全身)
   - **✨ ボタン (左下)**: エフェクトプリセット切替 (リッチ / クラシック MMD)
   - **シャッターボタン (中央)**: 写真撮影 → プレビュー → 保存
   - **📁 ボタン (右上)**: アセット選択パネル (モデル / モーション / カメラ / ステージ / 音楽)
3. 手動カメラモード中のマウス操作：
   - 左クリック+ドラッグ：カメラ回転
   - 右クリック+ドラッグ：カメラ移動
   - ホイール：ズームイン/アウト
4. 画面下の再生バーで一時停止・シークが可能です

## アセットの配置

各フォルダにファイルを置くと、アプリ内のアセット選択パネル (📁) から選べるようになります。

| フォルダ    | 内容                 | 形式                       |
| ----------- | -------------------- | -------------------------- |
| `models/`   | キャラクターモデル   | `.pmx`                     |
| `motions/`  | ダンスモーション     | `.vmd`                     |
| `cameras/`  | カメラモーション     | `.vmd`                     |
| `stages/`   | ステージモデル       | `.pmx`                     |
| `audios/`   | 楽曲                 | `.mp3` `.wav` `.ogg` `.m4a` |

## ビルド方法

```bash
# 両方のプラットフォーム向けにビルド（現在の環境によって制限あり）
npm run build

# macOS向けにビルド（macOS環境が必要）
npm run build:mac

# Windows向けにビルド（Windows環境が必要）
npm run build:win
```

ビルドされたファイルは`build`ディレクトリに出力されます：

- macOS: `.dmg`ファイル (インストーラー)
- Windows: `.exe`ファイル (インストーラー)

## 注意事項

- MMD モデル・モーション・ステージ・カメラモーションの利用は、それぞれの制作者の利用規約に従ってください
- モデルデータの再配布は含まれていません。各自で合法的に取得したモデルを使用してください
- このプロジェクトは学習・非商用目的での利用を想定しています
- クロスプラットフォームビルドには制限があります（macOS 向けビルドは macOS で、Windows 向けビルドは Windows で行う必要があります）

## ライセンス

MIT License

## 謝辞

- [Babylon.js](https://www.babylonjs.com/) - 3D レンダリングエンジン
- [babylon-mmd](https://github.com/noname0310/babylon-mmd) - Babylon.js での MMD サポート
- [Electron](https://www.electronjs.org/) - クロスプラットフォームデスクトップアプリ開発フレームワーク
- MMD モデル・モーションの制作者様
