const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static('./'));

// API 엔드포인트
app.get('/api/contacts', (req, res) => {
    fs.readFile('./data.json', (err, content) => {
        if (err) {
            return res.status(500).send(`서버 오류: ${err.code}`);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(content);
    });
});

// 기본 라우트 - index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 오류 페이지
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// 서버 시작
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
        console.log(`API 엔드포인트: http://localhost:${PORT}/api/contacts`);
    });
}

// Vercel용 export
module.exports = app; 