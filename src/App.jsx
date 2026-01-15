import React, { useRef, useState } from 'react'

export default function App() {
    const [subject, setSubject] = useState('mathematics');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [solution, setSolution] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const form = new FormData();
            form.append('subject', subject);
            form.append('text', text);
            if (file) form.append('file', file);

            const res = await fetch('http://localhost:8080/api/solve', {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            if (data.solution) {
                setSolution(data.solution);
            } else if (data.error) {
                setSolution('Error: ' + data.error);
            }
        } catch (err) {
            setSolution('Request failed');
        } finally {
            setLoading(false);
        }
    }

    function handleFile(e) {
        setFile(e.target.files[0] || null);
    }

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            alert('Camera not available');
        }
    }

    function captureImage() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const f = new File([blob], 'capture.png', { type: 'image/png' });
            setFile(f);
        });
    }

    function renderLatexToHtml(latex) {
        if (!window.katex) return latex;
        try {
            return window.katex.renderToString(latex, { throwOnError: false });
        } catch (e) {
            return latex;
        }
    }

    return (
        <div className="app">
            <h1>AI Problem Solver</h1>
            <form onSubmit={handleSubmit} className="form">
                <label>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                </select>

                <label>Problem (type or paste)</label>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={6} />

                <label>Or upload / capture an image</label>
                <input type="file" accept="image/*" onChange={handleFile} />

                <div className="camera-controls">
                    <button type="button" onClick={startCamera}>Start Camera</button>
                    <button type="button" onClick={captureImage}>Capture</button>
                </div>

                <video ref={videoRef} style={{ width: 320, height: 240 }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <button type="submit" disabled={loading}>{loading ? 'Solving...' : 'Solve'}</button>
            </form>

            <div className="output">
                <h2>Solution</h2>
                <div className="solution" dangerouslySetInnerHTML={{ __html: renderLatexToHtml(solution) }} />
                <pre style={{ whiteSpace: 'pre-wrap' }}>{!solution && 'No solution yet.'}</pre>
            </div>
        </div>
    )
}
