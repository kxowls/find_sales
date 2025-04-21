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
  const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  contactsData = JSON.parse(rawData);
  console.log(`데이터 로드 완료: ${contactsData.length}개의 연락처 데이터`);
} catch (error) {
  console.error('데이터 로드 중 오류 발생:', error);
  contactsData = [];
}

// 정적 파일 제공 - 명시적 경로 설정
app.use(express.static(path.join(__dirname, './')));

// API 엔드포인트
app.get('/api/contacts', (req, res) => {
  console.log('API 요청 수신: /api/contacts');
  res.json(contactsData);
});

// 데이터 파일 직접 제공
app.get('/data.json', (req, res) => {
  console.log('데이터 파일 요청 수신: /data.json');
  res.sendFile(DATA_FILE_PATH);
});

// 기본 라우트 - index.html 제공
app.get('/', (req, res) => {
  console.log('루트 페이지 요청 수신: /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 오류 페이지
app.use((req, res) => {
  console.log(`404 요청: ${req.url}`);
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