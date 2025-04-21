const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`요청: ${req.url}`);
    
    // API 요청 처리
    if (req.url === '/api/contacts') {
        fs.readFile('./data.json', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(`서버 오류: ${err.code}`);
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        });
        return;
    }
    
    // 정적 파일 제공
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // 파일 확장자 추출
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    // 확장자에 따른 콘텐츠 타입 설정
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    // 파일 읽기
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // 파일을 찾을 수 없는 경우
            if (err.code === 'ENOENT') {
                fs.readFile('./404.html', (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // 서버 오류
                res.writeHead(500);
                res.end(`서버 오류: ${err.code}`);
            }
        } else {
            // 성공
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
    console.log(`API 엔드포인트: http://localhost:${PORT}/api/contacts`);
}); 