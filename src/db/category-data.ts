export type CategoryEntry = {
  code: string;
  majorName: string;
  minorName: string;
};

// Shared by seed-categories.ts (initial setup) and seed.ts (full demo seed).
// 99 is reserved for "기타" at both levels; 9999 is the catch-all.
export const CATEGORIES: CategoryEntry[] = [
  // 문학 (01)
  { code: "0101", majorName: "문학", minorName: "순수문학" },
  { code: "0102", majorName: "문학", minorName: "대중문학" },
  { code: "0103", majorName: "문학", minorName: "고전문학" },
  { code: "0104", majorName: "문학", minorName: "세계문학" },
  { code: "0105", majorName: "문학", minorName: "신화" },
  { code: "0106", majorName: "문학", minorName: "시" },
  { code: "0107", majorName: "문학", minorName: "동화" },
  { code: "0108", majorName: "문학", minorName: "철학" },
  { code: "0199", majorName: "문학", minorName: "기타" },
  // 과학 (02)
  { code: "0201", majorName: "과학", minorName: "물리" },
  { code: "0202", majorName: "과학", minorName: "화학" },
  { code: "0203", majorName: "과학", minorName: "생물학" },
  { code: "0204", majorName: "과학", minorName: "지구과학" },
  { code: "0205", majorName: "과학", minorName: "천문학" },
  { code: "0206", majorName: "과학", minorName: "수학" },
  { code: "0207", majorName: "과학", minorName: "IT" },
  { code: "0208", majorName: "과학", minorName: "인물" },
  { code: "0299", majorName: "과학", minorName: "기타" },
  // 사회 (03)
  { code: "0301", majorName: "사회", minorName: "한국지리" },
  { code: "0302", majorName: "사회", minorName: "세계지리" },
  { code: "0303", majorName: "사회", minorName: "정치" },
  { code: "0304", majorName: "사회", minorName: "경제" },
  { code: "0305", majorName: "사회", minorName: "법" },
  { code: "0306", majorName: "사회", minorName: "한국사" },
  { code: "0307", majorName: "사회", minorName: "세계사" },
  { code: "0399", majorName: "사회", minorName: "기타" },
  // 생활 (04)
  { code: "0401", majorName: "생활", minorName: "음식" },
  { code: "0402", majorName: "생활", minorName: "여가" },
  { code: "0403", majorName: "생활", minorName: "교통" },
  { code: "0404", majorName: "생활", minorName: "가사" },
  { code: "0405", majorName: "생활", minorName: "전통" },
  { code: "0406", majorName: "생활", minorName: "회사" },
  { code: "0407", majorName: "생활", minorName: "종교" },
  { code: "0499", majorName: "생활", minorName: "기타" },
  // 언어 (05)
  { code: "0501", majorName: "언어", minorName: "단어" },
  { code: "0502", majorName: "언어", minorName: "속담" },
  { code: "0503", majorName: "언어", minorName: "외국어" },
  { code: "0599", majorName: "언어", minorName: "기타" },
  // 미술 (06)
  { code: "0601", majorName: "미술", minorName: "평면미술" },
  { code: "0602", majorName: "미술", minorName: "입체미술" },
  { code: "0603", majorName: "미술", minorName: "패션" },
  { code: "0604", majorName: "미술", minorName: "용어" },
  { code: "0605", majorName: "미술", minorName: "인물" },
  { code: "0699", majorName: "미술", minorName: "기타" },
  // 음악 (07)
  { code: "0701", majorName: "음악", minorName: "클래식" },
  { code: "0702", majorName: "음악", minorName: "대중가요" },
  { code: "0703", majorName: "음악", minorName: "팝" },
  { code: "0704", majorName: "음악", minorName: "전통" },
  { code: "0705", majorName: "음악", minorName: "악기" },
  { code: "0706", majorName: "음악", minorName: "용어" },
  { code: "0707", majorName: "음악", minorName: "인물" },
  { code: "0799", majorName: "음악", minorName: "기타" },
  // 스포츠 (08)
  { code: "0801", majorName: "스포츠", minorName: "축구" },
  { code: "0802", majorName: "스포츠", minorName: "야구" },
  { code: "0803", majorName: "스포츠", minorName: "구기" },
  { code: "0804", majorName: "스포츠", minorName: "전통" },
  { code: "0805", majorName: "스포츠", minorName: "육상" },
  { code: "0806", majorName: "스포츠", minorName: "수상" },
  { code: "0807", majorName: "스포츠", minorName: "겨울" },
  { code: "0808", majorName: "스포츠", minorName: "올림픽" },
  { code: "0899", majorName: "스포츠", minorName: "기타" },
  // 예능 (09)
  { code: "0901", majorName: "예능", minorName: "영화" },
  { code: "0902", majorName: "예능", minorName: "드라마" },
  { code: "0903", majorName: "예능", minorName: "방송" },
  { code: "0904", majorName: "예능", minorName: "인물" },
  { code: "0999", majorName: "예능", minorName: "기타" },
  // 서브컬처 (10)
  { code: "1001", majorName: "서브컬처", minorName: "만화" },
  { code: "1002", majorName: "서브컬처", minorName: "게임" },
  { code: "1099", majorName: "서브컬처", minorName: "기타" },
  // 기타 (99)
  { code: "9999", majorName: "기타", minorName: "기타" },
];
