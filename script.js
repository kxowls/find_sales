// 초기 데이터
let allData = [];
let currentSearchTerm = '';  // 현재 검색어 저장 변수 추가

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
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

    // 데이터 로드
    async function loadData() {
        try {
            console.log('API에서 데이터 로드 시도 중...');
            // 먼저 API 엔드포인트에서 시도
            const response = await fetch('/api/contacts');
            if (!response.ok) {
                throw new Error(`API 연결 실패: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                allData = data;
                console.log(`API에서 데이터 로드 완료: ${allData.length}개의 항목`);
                return;
            } else {
                throw new Error('API에서 유효한 데이터를 반환하지 않았습니다');
            }
        } catch (apiError) {
            console.error('API 오류:', apiError);
            try {
                console.log('정적 파일에서 데이터 로드 시도 중...');
                // API 실패 시 정적 파일에서 시도
                const fallbackResponse = await fetch('/data.json');
                if (!fallbackResponse.ok) {
                    throw new Error(`정적 파일 로드 실패: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
                }
                const data = await fallbackResponse.json();
                if (Array.isArray(data) && data.length > 0) {
                    allData = data;
                    console.log(`정적 파일에서 데이터 로드 완료: ${allData.length}개의 항목`);
                } else {
                    throw new Error('정적 파일에서 유효한 데이터를 반환하지 않았습니다');
                }
            } catch (fallbackError) {
                console.error('데이터 로드 실패:', fallbackError);
                alert('데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.');
            }
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

    // 검색 실행
    function performSearch() {
        currentSearchTerm = searchInput.value.toLowerCase().trim();
        const excludeNonUnivChecked = excludeNonUniv.checked;
        const excludeOldChecked = excludeOld.checked;

        if (!Array.isArray(allData) || allData.length === 0) {
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
            const sales2Highlighted = highlightText(item.sales2 || '담당자 미지정', currentSearchTerm);
            
            companyItem.innerHTML = `
                <h3>${nameHighlighted}</h3>
                <p>${sales2Highlighted}</p>
            `;
            companyItem.addEventListener('click', () => showDetails(item));
            gridContainer.appendChild(companyItem);
        });

        companyList.appendChild(gridContainer);
    }

    // 상세 정보 표시
    function showDetails(item) {
        // 모든 필드에 하이라이트 적용
        const nameHighlighted = highlightText(item.name || '정보 없음', currentSearchTerm);
        const phoneHighlighted = highlightText(item.phone || '정보 없음', currentSearchTerm);
        const addressHighlighted = highlightText(item.address || '정보 없음', currentSearchTerm);
        const managerHighlighted = highlightText(item.manager || '정보 없음', currentSearchTerm);
        const sales1Highlighted = highlightText(item.sales1 || '정보 없음', currentSearchTerm);
        const sales2Highlighted = highlightText(item.sales2 || '정보 없음', currentSearchTerm);
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
                <p><strong>거래처 담당:</strong> ${managerHighlighted}</p>
                <p><strong>영업1팀 담당:</strong> ${sales1Highlighted}</p>
                <p><strong>영업2팀 담당:</strong> ${sales2Highlighted}</p>
            </div>
            <div class="detail-group">
                <h3>추가 정보</h3>
                <p><strong>영역:</strong> ${regionHighlighted}</p>
                <p><strong>대학:</strong> ${universityHighlighted}</p>
            </div>
        `;
        
        showDetailSection();
    }

    // 섹션 표시/숨김 함수들
    function showSearchSection() {
        searchSection.style.display = 'block';
        resultsSection.style.display = 'none';
        detailSection.style.display = 'none';
        searchInput.focus();
    }

    function showResultsSection() {
        searchSection.style.display = 'none';
        resultsSection.style.display = 'block';
        detailSection.style.display = 'none';
    }

    function showDetailSection() {
        searchSection.style.display = 'none';
        resultsSection.style.display = 'none';
        detailSection.style.display = 'block';
    }

    // 이벤트 리스너
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    backToSearch.addEventListener('click', showSearchSection);
    backToResults.addEventListener('click', showResultsSection);

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