import React, { useRef, useState } from 'react'

export default function App() {
    const [subject, setSubject] = useState('mathematics');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [solution, setSolution] = useState('');
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSolution('');

        if (!text.trim() && !file) {
            setError('Please enter a problem or upload an image');
            return;
        }

        setLoading(true);
        try {
            const form = new FormData();
            form.append('subject', subject);
            form.append('text', text);
            if (file) form.append('file', file);

            const res = await fetch('https://d619c742c02a.ngrok-free.app/api/solve', {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            if (data.solution) {
                setSolution(data.solution);
            } else if (data.error) {
                setError('Error: ' + data.error);
            }
        } catch (err) {
            setError('Request failed: ' + err.message);
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
            videoRef.current.style.display = 'block';
        } catch (err) {
            setError('Camera not available: ' + err.message);
        }
    }

    function captureImage() {
        const video = videoRef.current;
        if (!video.videoWidth) {
            setError('Video not ready');
            return;
        }
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const f = new File([blob], 'capture.png', { type: 'image/png' });
            setFile(f);
            setError('');
        });
    }

    function stopCamera() {
        const video = videoRef.current;
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
        }
    }

    return (
        <div className="app">
            <h1>🧮 AI Problem Solver</h1>
            <p className="subtitle">Mathematics • Physics • Chemistry</p>

            <div className="container">
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="subject">📚 Subject</label>
                        <select id="subject" value={subject} onChange={e => setSubject(e.target.value)}>
                            <option value="mathematics">Mathematics</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="text">✍️ Problem (type or paste)</label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={6}
                            placeholder="Enter your problem here..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file">🖼️ Or upload an image</label>
                        <input id="file" type="file" accept="image/*" onChange={handleFile} />
                        {file && <p className="file-info">Selected: {file.name}</p>}
                    </div>

                    <div className="form-group">
                        <label>📷 Or capture from camera</label>
                        <div className="camera-controls">
                            <button type="button" className="btn-secondary" onClick={startCamera}>Start Camera</button>
                            <button type="button" className="btn-secondary" onClick={captureImage}>Capture</button>
                            <button type="button" className="btn-secondary" onClick={stopCamera}>Stop</button>
                        </div>
                        <video ref={videoRef} style={{ display: 'none', width: '100%', maxWidth: 400, marginTop: 10 }} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? '⏳ Solving...' : '🚀 Solve'}
                    </button>
                </form>

                <div className="output">
                    <h2>📝 Solution</h2>

                    {error && <div className="error">{error}</div>}

                    {solution && (
                        <div className="solution">
                            <pre>{solution}</pre>
                        </div>
                    )}

                    {!solution && !error && (
                        <p className="placeholder">No solution yet. Submit a problem to get started!</p>
                    )}
                </div>            </div>
        </div>
    )
}