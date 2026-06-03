// firebaseConfig.js

/**
 * Firebaseの設定オブジェクト
 * 
 * TODO: 
 * 1. Firebase Console (https://console.firebase.google.com/) でプロジェクトを作成します。
 * 2. プロジェクトの設定から「ウェブアプリ」を追加し、生成された構成（Config）の内容を以下にコピーして貼り付けてください。
 * 3. Authentication（メール/パスワード認証）と Cloud Firestore（データベース）を有効にしてください。
 */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPb0Q6_iqgGxZawukpI-DlbI9o6Ib-zkg",
  authDomain: "project1-2a3a9.firebaseapp.com",
  projectId: "project1-2a3a9",
  storageBucket: "project1-2a3a9.firebasestorage.app",
  messagingSenderId: "68195342631",
  appId: "1:68195342631:web:8eadf81e54606f05cf3102",
  measurementId: "G-9ZDFV2KNRH"
};

// Firebase SDKが読み込まれている場合に初期化を実行
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
  // 他のスクリプトから利用できるようにグローバルに設定
  window.db = firebase.firestore();
  window.auth = firebase.auth();
} else {
  console.error("Firebase SDKが読み込まれていません。HTMLファイル内のスクリプト順序を確認してください。");
}
