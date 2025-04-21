const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static(__dirname));

// API 엔드포인트
app.get('/api/contacts', (req, res) => {
    try {
        const data = fs.readFileSync('./data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('데이터 파일 읽기 오류:', err);
        res.status(500).json({ error: '데이터를 불러오는데 실패했습니다.' });
    }
});

// 기본 라우트 - 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 페이지
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
    console.log(`API 엔드포인트: http://localhost:${PORT}/api/contacts`);
});

// Vercel 서버리스 함수를 위한 export
module.exports = app; 