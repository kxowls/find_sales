const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 데이터 파일 경로
const DATA_FILE_PATH = path.join(__dirname, 'data.json');

// 데이터 로드 함수
let contactsData = [];
try {
  if (fs.existsSync(DATA_FILE_PATH)) {
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    contactsData = JSON.parse(rawData);
    console.log(`데이터 로드 완료: ${contactsData.length}개의 연락처 데이터`);
  } else {
    console.error('data.json 파일이 존재하지 않습니다.');
    contactsData = [];
  }
} catch (error) {
  console.error('데이터 로드 중 오류 발생:', error);
  contactsData = [];
}

// 정적 파일 제공
app.use(express.static('./'));

// API 엔드포인트
app.get('/api/contacts', (req, res) => {
  try {
    res.json(contactsData);
  } catch (err) {
    console.error(`API 오류: ${err.message}`);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
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