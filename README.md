# けいさんプリント

小2向けの計算反復練習アプリ（PWA）。

## ローカルで動かす

```bash
npm install
npm run dev
```

## GitHub Pagesへの公開手順

1. GitHubで新しいリポジトリを作成する（例: `keisan-pwa`）
2. このプロジェクトをpushする

   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/keisan-pwa.git
   git push -u origin main
   ```

3. GitHubのリポジトリ画面で `Settings > Pages` を開く
4. "Build and deployment" の "Source" を **GitHub Actions** に設定する
5. `main` にpushすると `.github/workflows/deploy.yml` が自動でビルド＆公開する
6. 数分後、`https://<あなたのユーザー名>.github.io/keisan-pwa/` でアクセスできる

## iPadにインストールする

1. iPadのSafariで公開したURLを開く
2. 共有アイコン（□に↑）をタップ
3. 「ホーム画面に追加」を選ぶ
4. ホーム画面のアイコンから起動するとフルスクリーンで動作する

## 補足

- データ（プリントの記録・タイマー設定）は端末の `localStorage` に保存されます。ブラウザのデータを消去すると記録も消えます。
- オフラインでも一度開いたことがあれば動作するよう、簡易的なservice workerでキャッシュしています。
