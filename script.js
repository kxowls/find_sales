// 초기 데이터
let allData = [];
let currentSearchTerm = '';  // 현재 검색어 저장 변수 추가
let isDataLoaded = false;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM이 로드되었습니다.');

    // DOM 요소
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const excludeNonUniv = document.getElementById('exclude-non-univ');
    const excludeOld = document.getElementById('exclude-old');
    const searchSection = document.querySelector('.search-section');
    const resultsSection = document.querySelector('.results-section');
    const detailSection = document.querySelector('.detail-section');
    const companyList = document.querySelector('.company-list');
    const companyDetails = document.querySelector('.company-details');
    const backToSearch = document.getElementById('back-to-search');
    const backToResults = document.getElementById('back-to-results');

    let filteredData = [];
    let currentState = 'search'; // 현재 상태 추적: 'search', 'results', 'detail'

    // 데이터 로드
    async function loadData() {
        console.log('데이터 로딩 시작...');
        if (isDataLoaded && allData.length > 0) {
            console.log('이미 데이터가 로드되어 있습니다.');
            return;
        }

        // 두 방법 모두 시도
        await Promise.allSettled([
            loadFromAPI(),
            loadFromStaticFile()
        ]).then(results => {
            console.log('데이터 로딩 시도 결과:', results);
            if (!isDataLoaded) {
                alert('데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.');
            }
        });
    }

    // API에서 데이터 로드
    async function loadFromAPI() {
        try {
            console.log('API에서 데이터 로드 시도 중...');
            const response = await fetch('/api/contacts');
            console.log('API 응답:', response);

            if (!response.ok) {
                throw new Error(`API 연결 실패: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API 데이터 수신:', data && Array.isArray(data) ? `${data.length}개 항목` : '유효하지 않은 데이터');

            if (Array.isArray(data) && data.length > 0) {
                allData = data;
                isDataLoaded = true;
                console.log(`API에서 데이터 로드 완료: ${allData.length}개의 항목`);
                return true;
            } else {
                throw new Error('API에서 유효한 데이터를 반환하지 않았습니다');
            }
        } catch (error) {
            console.error('API 데이터 로드 실패:', error);
            return false;
        }
    }

    // 정적 파일에서 데이터 로드
    async function loadFromStaticFile() {
        try {
            console.log('정적 파일에서 데이터 로드 시도 중...');
            const response = await fetch('/data.json');
            console.log('정적 파일 응답:', response);

            if (!response.ok) {
                throw new Error(`정적 파일 로드 실패: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('정적 파일 데이터 수신:', data && Array.isArray(data) ? `${data.length}개 항목` : '유효하지 않은 데이터');

            if (Array.isArray(data) && data.length > 0 && !isDataLoaded) {
                allData = data;
                isDataLoaded = true;
                console.log(`정적 파일에서 데이터 로드 완료: ${allData.length}개의 항목`);
                return true;
            } else if (isDataLoaded) {
                console.log('이미 API에서 데이터를 로드했으므로 정적 파일 데이터는 사용하지 않습니다.');
                return true;
            } else {
                throw new Error('정적 파일에서 유효한 데이터를 반환하지 않았습니다');
            }
        } catch (error) {
            console.error('정적 파일 데이터 로드 실패:', error);
            return false;
        }
    }

    // 텍스트에서 검색어 하이라이트 추가 함수
    function highlightText(text, searchTerm) {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(searchTerm.trim(), 'gi');
        return text.toString().replace(regex, match =>
            `<span class="highlight">${match}</span>`
        );
    }

    // 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', (event) => {
        const state = event.state?.page || 'search';
        console.log('popstate 이벤트:', state);

        switch (state) {
            case 'search':
                showSearchSection(false);
                break;
            case 'results':
                showResultsSection(false);
                break;
            case 'detail':
                if (event.state?.item) {
                    showDetails(event.state.item, false);
                } else {
                    showSearchSection(false);
                }
                break;
        }
    });

    // 검색 실행
    function performSearch() {
        currentSearchTerm = searchInput.value.toLowerCase().trim();
        console.log(`검색 시작: "${currentSearchTerm}"`);

        const excludeNonUnivChecked = excludeNonUniv.checked;
        const excludeOldChecked = excludeOld.checked;

        if (!isDataLoaded || !Array.isArray(allData) || allData.length === 0) {
            console.log('검색 실패: 데이터가 로드되지 않았습니다.');
            companyList.innerHTML = '<div class="no-results">데이터가 로드되지 않았습니다. 페이지를 새로고침 해주세요.</div>';
            showResultsSection();
            return;
        }

        filteredData = allData.filter(item => {
            const matchesSearch = Object.values(item).some(value =>
                String(value).toLowerCase().includes(currentSearchTerm)
            );

            // 대학 여부 확인 (university 필드가 비어있지 않으면 대학으로 간주)
            const isUniversity = item.university && item.university.trim() !== '';
            // 구 거래처 여부 확인 (name 필드에 "구)" 포함 시 구 거래처로 간주)
            const isOld = item.name && item.name.includes('구)');

            if (excludeNonUnivChecked && !isUniversity) return false;
            if (excludeOldChecked && isOld) return false;

            return matchesSearch;
        });

        console.log(`필터링된 결과: ${filteredData.length}개 항목`);
        displayResults();
        showResultsSection();
    }

    // 결과 표시
    function displayResults() {
        companyList.innerHTML = '';

        if (filteredData.length === 0) {
            companyList.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        const gridContainer = document.createElement('div');
        gridContainer.className = 'company-grid';

        filteredData.forEach(item => {
            const companyItem = document.createElement('div');
            companyItem.className = 'company-item';

            // 검색어 하이라이트 적용
            const nameHighlighted = highlightText(item.name || '거래처명 없음', currentSearchTerm);

            // 담당자 정보 표시 - 코드(_이전) 제거하고 이름만 표시
            let managerDisplay = extractName(item.manager);

            companyItem.innerHTML = `
                <h3>${nameHighlighted}</h3>
                <div class="company-info-simple">
                    <span class="info-label">담당자:</span>
                    <span class="info-value">${managerDisplay}</span>
                </div>
            `;
            companyItem.addEventListener('click', () => showDetails(item));
            gridContainer.appendChild(companyItem);
        });

        companyList.appendChild(gridContainer);
    }

    // 담당자 코드에서 이름만 추출하는 함수
    function extractName(text) {
        if (!text) return '-';

        // xx_이름 형식에서 이름만 추출
        const match = text.match(/_([^_]+)$/);
        if (match && match[1]) {
            return match[1];
        }

        return text;
    }

    // 상세 정보 표시
    function showDetails(item, addToHistory = true) {
        // 모든 필드에 하이라이트 적용
        const nameHighlighted = highlightText(item.name || '정보 없음', currentSearchTerm);
        const phoneHighlighted = highlightText(item.phone || '정보 없음', currentSearchTerm);
        const addressHighlighted = highlightText(item.address || '정보 없음', currentSearchTerm);

        // 담당자 정보는 이름만 표시
        const managerHighlighted = highlightText(extractName(item.manager), currentSearchTerm);

        const regionHighlighted = highlightText(item.region || '정보 없음', currentSearchTerm);
        const universityHighlighted = highlightText(item.university || '대학 아님', currentSearchTerm);

        companyDetails.innerHTML = `
            <div class="detail-group">
                <h3>기본 정보</h3>
                <p><strong>거래처명:</strong> ${nameHighlighted}</p>
                <p><strong>전화번호:</strong> ${phoneHighlighted}</p>
                <p><strong>주소:</strong> ${addressHighlighted}</p>
            </div>
            <div class="detail-group">
                <h3>담당자 정보</h3>
                <p><strong>담당자:</strong> ${managerHighlighted}</p>
            </div>
            <div class="detail-group">
                <h3>추가 정보</h3>
                <p><strong>영역:</strong> ${regionHighlighted}</p>
                <p><strong>대학:</strong> ${universityHighlighted}</p>
            </div>
        `;

        showDetailSection(addToHistory);
        if (addToHistory) {
            history.pushState({ page: 'detail', item: item }, '', `/detail/${encodeURIComponent(item.name)}`);
        }
    }

    // 섹션 표시/숨김 함수들
    function showSearchSection(addToHistory = true) {
        searchSection.style.display = 'block';
        resultsSection.style.display = 'none';
        detailSection.style.display = 'none';
        searchInput.focus();
        currentState = 'search';

        if (addToHistory) {
            history.pushState({ page: 'search' }, '', '/');
        }
    }

    function showResultsSection(addToHistory = true) {
        searchSection.style.display = 'none';
        resultsSection.style.display = 'block';
        detailSection.style.display = 'none';
        currentState = 'results';

        if (addToHistory) {
            history.pushState({ page: 'results' }, '', '/results');
        }
    }

    function showDetailSection(addToHistory = true) {
        searchSection.style.display = 'none';
        resultsSection.style.display = 'none';
        detailSection.style.display = 'block';
        currentState = 'detail';

        if (addToHistory) {
            history.pushState({ page: 'detail' }, '', '/detail');
        }
    }

    // 이벤트 리스너
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    backToSearch.addEventListener('click', () => showSearchSection());
    backToResults.addEventListener('click', () => showResultsSection());

    // 필터 변경 시 자동 검색
    excludeNonUniv.addEventListener('change', () => {
        if (searchInput.value.trim()) performSearch();
    });
    excludeOld.addEventListener('change', () => {
        if (searchInput.value.trim()) performSearch();
    });

    // 초기 데이터 로드
    loadData().then(() => {
        console.log('애플리케이션 초기화 완료');
    }).catch(error => {
        console.error('애플리케이션 초기화 중 오류 발생:', error);
    });
}); 