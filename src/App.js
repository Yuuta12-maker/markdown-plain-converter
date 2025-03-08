import React, { useState, useRef } from 'react';

// スタイリッシュなUI用のカスタムボタンコンポーネント
const Button = ({ onClick, children, primary = false }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition-all ${
        primary
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};

const App = () => {
  const [markdown, setMarkdown] = useState('');
  const [plainText, setPlainText] = useState('');
  const printableAreaRef = useRef(null);

  // マークダウンからプレーンテキストへの変換関数
  const convertToPlainText = () => {
    if (!markdown) return;
    
    let text = markdown;
    
    // 見出しの変換 (# 見出し -> 見出し)
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    
    // 太字と斜体の変換
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // ***太字斜体*** -> 太字斜体
    text = text.replace(/___(.+?)___/g, '$1');       // ___太字斜体___ -> 太字斜体
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');     // **太字** -> 太字
    text = text.replace(/__(.+?)__/g, '$1');         // __太字__ -> 太字
    text = text.replace(/\*(.+?)\*/g, '$1');         // *斜体* -> 斜体
    text = text.replace(/_(.+?)_/g, '$1');           // _斜体_ -> 斜体
    
    // 取り消し線の変換
    text = text.replace(/~~(.+?)~~/g, '$1');         // ~~取り消し線~~ -> 取り消し線
    
    // コードの変換
    text = text.replace(/`(.+?)`/g, '$1');           // `コード` -> コード
    
    // リストの変換 - 箇条書きをバレットポイント（•）に変換
    text = text.replace(/^[ \t]*[-*+][ \t]+(.+)$/gm, '• $1'); // 箇条書き
    text = text.replace(/^[ \t]*\d+\.[ \t]+(.+)$/gm, '• $1'); // 番号付きリスト
    
    // 水平線を削除
    text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');
    
    // リンクの変換 [表示テキスト](URL) -> 表示テキスト
    text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    
    // 画像の変換 ![代替テキスト](URL) -> 代替テキスト
    text = text.replace(/!\[(.+?)\]\(.+?\)/g, '$1');
    
    // 引用の変換 - 引用符号を削除するだけ
    text = text.replace(/^>\s+(.+)$/gm, '$1');
    
    // コードブロックの変換
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      // バッククォートを取り除き、最初と最後の行を削除
      const lines = match.split('\n');
      return lines.slice(1, -1).join('\n');
    });
    
    // 複数の空行を1つにまとめる
    text = text.replace(/\n{3,}/g, '\n\n');
    
    setPlainText(text);
  };

  // 印刷用関数（PDF出力の代替）
  const printText = () => {
    const printContent = printableAreaRef.current.innerText;
    
    // 印刷用のHTMLを作成
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>マークダウン変換テキスト</title>
          <style>
            body {
              font-family: sans-serif;
              line-height: 1.5;
              margin: 2cm;
              color: #333;
              background-color: #fff;
            }
            pre {
              white-space: pre-wrap;
              font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  // テキストファイルをダウンロードする関数
  const downloadTextFile = () => {
    const text = plainText || markdown;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-text.txt';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // サンプルテキストを読み込む関数
  const loadSampleText = () => {
    const sampleMarkdown = `# マインドエンジニアリング・コーチング

## あなたの人生を根本から変える、科学的アプローチ

>「今の現状を超えて、本当にやりたいことを実現したい」

>「努力はしているのに、なぜか前に進まない」

>「何かもっと大きな目標に向かって生きたい」

そんな思いを抱えていませんか？

# マインドエンジニアリング・コーチングとは

マインドエンジニアリング・コーチングは、最新の認知科学的知見を基盤とし、人が本来持つマインドの力を最大限に引き出す実践的プログラムです。

従来の「根性論」や「ポジティブシンキング」とは一線を画した、科学的アプローチであなたの可能性を解放します。

## このコーチングで得られること

* 現状の制約を超えた、真のゴール設定
* 努力感なく自然にゴールに向かうマインドの獲得
* あなたが100%やりたいことを明確にする力`;
    
    setMarkdown(sampleMarkdown);
  };

  // ファイルアップロード処理
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdown(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">マークダウン変換ツール</h1>
          
          {/* 入力セクション */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">入力</h2>
              <div className="flex gap-3">
                <button 
                  onClick={loadSampleText}
                  className="text-sm text-blue-500 cursor-pointer hover:text-blue-600"
                >
                  サンプル文章を読み込む
                </button>
                <label className="text-sm text-blue-500 cursor-pointer hover:text-blue-600">
                  ファイルをアップロード
                  <input
                    type="file"
                    accept=".md,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="マークダウンテキストを入力または貼り付けてください..."
              className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          {/* ボタングループ */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={convertToPlainText} primary>
              プレーンテキストに変換
            </Button>
            <Button onClick={printText}>
              印刷/PDFに変換
            </Button>
            <Button onClick={downloadTextFile}>
              テキストファイルをダウンロード
            </Button>
          </div>
          
          {/* 出力セクション */}
          {plainText && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">変換結果</h2>
              <div 
                ref={printableAreaRef}
                className="w-full h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-auto whitespace-pre-wrap"
              >
                {plainText}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="text-center mt-8 text-gray-500 text-sm">
        © 2025 マークダウン変換ツール
      </footer>
    </div>
  );
};

export default App;