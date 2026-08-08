\# 周辺スポット検索アプリケーション



画面中央の指定位置から、指定した半径内にある周辺スポットを検索・表示するWebアプリケーションです。



\---



\## 環境構築



\### 必須要件

\* Docker 20.10 以上

\* Docker Compose v2 以上



\### 環境変数の設定

`frontend` および `backend` の各ディレクトリにある `.env.example` をコピーして `.env` ファイルを作成してください。



```bash

\# フロントエンド側例

NEXT\_PUBLIC\_API\_URL=http://localhost:3001

