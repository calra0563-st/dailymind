/**
 * ==============================================================================
 * [아침 감정 체크인 - 구글 앱스 스크립트 (code.gs)]
 * 
 * 구글 스프레드시트 탭 구성:
 * 1. '학생명단' : 번호, 이름
 * 2. '감정기록' : 일시, 번호, 이름, 감정이모지, 한줄마음
 *
 * * 배포 방법:
 * 1. 스프레드시트 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 code.gs 파일의 전체 내용을 붙여넣기
 * 3. 오른쪽 상단 [배포] > [새 배포] 클릭
 * 4. 유형 선택: [웹 앱] 선택
 * 5. 설정:
 *    - 설명: 아침 감정 체크인 v1
 *    - 다음 사용자 권한으로 앱 실행: 나 (your-email@gmail.com)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- 중요!
 * 6. [배포] 클릭 후 생성된 [웹 앱 URL]을 복사하여 웹앱의 설정 창에 붙여넣으세요.
 * ==============================================================================
 */

// 시트 이름 상수 정의
const SHEET_STUDENTS = '학생명단';
const SHEET_RECORDS = '감정기록';

/**
 * 최초 1회 실행하여 시트 탭 및 기본 헤더, 예시 학생 명단을 자동 생성하는 함수
 * Apps Script 편집기 상단에서 'setupInitialSheet' 선택 후 [실행]을 누르면 즉시 설정됩니다.
 */
function setupInitialSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. 학생명단 시트 생성 및 초기화
  let studentSheet = ss.getSheetByName(SHEET_STUDENTS);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(SHEET_STUDENTS);
  }
  if (studentSheet.getLastRow() === 0) {
    const studentHeaders = ['번호', '이름'];
    studentSheet.appendRow(studentHeaders);
    // 기본 예시 학생 (꽃이름 닉네임 1번~20번)
    const defaultStudents = [
      [1, '민들레'], [2, '해바라기'], [3, '튤립'], [4, '장미'], [5, '코스모스'],
      [6, '수국'], [7, '동백꽃'], [8, '수선화'], [9, '제비꽃'], [10, '안개꽃'],
      [11, '은방울꽃'], [12, '라벤더'], [13, '무궁화'], [14, '백합'], [15, '목련'],
      [16, '진달래'], [17, '개나리'], [18, '연꽃'], [19, '채송화'], [20, '프리지아']
    ];
    studentSheet.getRange(2, 1, defaultStudents.length, 2).setValues(defaultStudents);
    // 스타일 적용
    studentSheet.getRange('A1:B1').setBackground('#F1F5F9').setFontWeight('bold').setHorizontalAlignment('center');
    studentSheet.setColumnWidth(1, 80);
    studentSheet.setColumnWidth(2, 140);
  }

  // 2. 감정기록 시트 생성 및 헤더 설정
  let recordSheet = ss.getSheetByName(SHEET_RECORDS);
  if (!recordSheet) {
    recordSheet = ss.insertSheet(SHEET_RECORDS);
  }
  if (recordSheet.getLastRow() === 0) {
    const recordHeaders = ['일시', '번호', '이름', '감정이모지', '한줄마음'];
    recordSheet.appendRow(recordHeaders);
    recordSheet.getRange('A1:E1').setBackground('#EEF2FF').setFontWeight('bold').setHorizontalAlignment('center');
    recordSheet.setColumnWidth(1, 160);
    recordSheet.setColumnWidth(2, 80);
    recordSheet.setColumnWidth(3, 120);
    recordSheet.setColumnWidth(4, 180);
    recordSheet.setColumnWidth(5, 300);
  }

  Logger.log('시트 초기화 완료! 학생명단과 감정기록 탭이 정상 생성되었습니다.');
}

/**
 * POST 요청 처리: 학생의 감정 체크인 데이터 저장
 * GitHub Pages의 CORS 에러를 원천 방지하기 위해 Content-Type: text/plain;charset=utf-8 로 전송된 JSON을 수신합니다.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: 'error', message: '데이터가 전달되지 않았습니다.' });
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 감정기록 시트 확인 또는 생성
    let sheet = ss.getSheetByName(SHEET_RECORDS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_RECORDS);
      sheet.appendRow(['일시', '번호', '이름', '감정이모지', '한줄마음']);
      sheet.getRange('A1:E1').setBackground('#EEF2FF').setFontWeight('bold').setHorizontalAlignment('center');
    }

    // 일시 생성 (한국 시간 기준)
    const timestamp = payload.timestamp || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    const number = payload.number !== undefined ? Number(payload.number) : '';
    const name = payload.name ? String(payload.name).trim() : '';
    const emotion = payload.emotion ? String(payload.emotion).trim() : '';
    const note = payload.note ? String(payload.note).trim() : '';

    // 행 추가: [일시, 번호, 이름, 감정이모지, 한줄마음]
    sheet.appendRow([timestamp, number, name, emotion, note]);

    return createJsonResponse({
      status: 'success',
      message: `${name} 학생의 감정 체크인이 저장되었습니다.`,
      record: {
        timestamp: timestamp,
        number: number,
        name: name,
        emotion: emotion,
        note: note
      }
    });

  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return createJsonResponse({
      status: 'error',
      message: '서버 오류 발생: ' + error.toString()
    });
  }
}

/**
 * GET 요청 처리: 학생 명단 조회, 감정 기록 조회, 시트 연결 확인
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. 학생 명단 요청
    if (action === 'getStudents') {
      let sheet = ss.getSheetByName(SHEET_STUDENTS);
      if (!sheet || sheet.getLastRow() < 2) {
        // 시트가 없거나 데이터가 없으면 자동 초기화
        setupInitialSheet();
        sheet = ss.getSheetByName(SHEET_STUDENTS);
      }

      const lastRow = sheet.getLastRow();
      let students = [];
      if (lastRow >= 2) {
        const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
        students = values
          .filter(row => row[0] !== '' || row[1] !== '')
          .map(row => ({
            number: Number(row[0]) || 0,
            name: String(row[1]).trim()
          }))
          .sort((a, b) => a.number - b.number);
      }

      return createJsonResponse({ status: 'success', data: students });
    }

    // 2. 감정 기록 목록 요청 (오늘 또는 전체)
    if (action === 'getRecords') {
      let sheet = ss.getSheetByName(SHEET_RECORDS);
      if (!sheet) {
        return createJsonResponse({ status: 'success', data: [] });
      }

      const lastRow = sheet.getLastRow();
      let records = [];
      if (lastRow >= 2) {
        const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
        const dateFilter = e.parameter.date; // 형식: yyyy-MM-dd (옵션)

        records = values
          .filter(row => row[0] !== '' && row[2] !== '')
          .map(row => {
            const timeStr = row[0] instanceof Date 
              ? Utilities.formatDate(row[0], "Asia/Seoul", "yyyy-MM-dd HH:mm:ss")
              : String(row[0]);
            return {
              timestamp: timeStr,
              number: Number(row[1]) || 0,
              name: String(row[2]),
              emotion: String(row[3]),
              note: String(row[4])
            };
          });

        if (dateFilter) {
          records = records.filter(r => r.timestamp.startsWith(dateFilter));
        }
      }

      return createJsonResponse({ status: 'success', data: records });
    }

    // 3. 시트 초기화 수동 트리거
    if (action === 'init') {
      setupInitialSheet();
      return createJsonResponse({ status: 'success', message: '스프레드시트 탭 및 초기화가 완료되었습니다.' });
    }

    // 4. 기본 ping / 상태 확인
    return createJsonResponse({
      status: 'success',
      message: '아침 감정 체크인 Apps Script 웹앱이 정상 작동 중입니다.',
      spreadsheetName: ss.getName(),
      time: Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss")
    });

  } catch (error) {
    Logger.log('doGet Error: ' + error.toString());
    return createJsonResponse({
      status: 'error',
      message: 'GET 오류: ' + error.toString()
    });
  }
}

/**
 * JSON 응답 생성 헬퍼 함수
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
