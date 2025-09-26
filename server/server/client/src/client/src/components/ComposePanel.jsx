import { useState } from 'react';

export default function ComposePanel() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setResponse(data.narration || data.error);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">🧠 Compose a Flow</h2>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows="4"
        placeholder="Describe what you want to build..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Generate Flow
      </button>
      {response && (
        <div className="mt-4 p-2 border rounded bg-gray-50 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
