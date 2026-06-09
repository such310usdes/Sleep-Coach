# Sleep Coach

睡眠改善アプリをローカルで起動するための手順です。

## 起動手順

1. Node.js をインストールします。
   - まだ入っていない場合は、Node.js 公式サイトから LTS 版を入れてください。
   - https://nodejs.org/

2. ターミナルでこのプロジェクトを開きます。

   ```sh
   cd "/Users/yoshidaakane/Documents/Sleep Coach"
   ```

3. 必要なパッケージをインストールします。

   ```sh
   npm install
   ```

4. アプリを起動します。

   ```sh
   npm run dev
   ```

5. ターミナルに表示された URL をブラウザで開きます。
   - 多くの場合は `http://localhost:5173/` です。

## 終了方法

起動中のターミナルで `control` キーを押しながら `C` を押します。

## 公開と更新の流れ

このアプリを他の人にも見てもらう場合は、GitHub と Vercel を使うと更新が楽です。

1. このプロジェクトを GitHub に保存します。
2. Vercel で GitHub リポジトリを選んで公開します。
3. 以後、コードを修正して GitHub に反映すると、Vercel の公開サイトも自動で更新されます。

今のアプリの記録データは、見る人それぞれのブラウザ内に保存されます。他の人が開いても、あなたの睡眠記録は表示されません。

## 修正を公開する基本手順

```sh
git status
git add .
git commit -m "Update sleep coach"
git push
```

GitHub と Vercel の接続が終わっていれば、`git push` のあとに公開サイトが自動更新されます。
