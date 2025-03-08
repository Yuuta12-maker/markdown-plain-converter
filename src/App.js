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
    // 基本的なマークダウン記法をプレーンテキストに変換
    // ここではインライン記法などは変換せず、そのまま保持
    setPlainText(markdown);
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
            }
            pre {
              white-space: pre-wrap;
              font-family: monospace;
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
              <div>
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