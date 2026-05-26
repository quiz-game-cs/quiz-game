import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { questions, playRecords, categories } from "./schema";

const CHAR_INTERVAL_MS = 120;

const SEED_CATEGORIES = [
  { name: "역사", displayOrder: 1 },
  { name: "과학", displayOrder: 2 },
  { name: "지리", displayOrder: 3 },
  { name: "문학", displayOrder: 4 },
  { name: "예술", displayOrder: 5 },
  { name: "수학", displayOrder: 6 },
  { name: "스포츠", displayOrder: 7 },
  { name: "문화", displayOrder: 8 },
  { name: "IT", displayOrder: 9 },
  { name: "영화", displayOrder: 10 },
  { name: "엔터테인먼트", displayOrder: 11 },
  { name: "음식", displayOrder: 12 },
  { name: "동물", displayOrder: 13 },
  { name: "게임", displayOrder: 14 },
  { name: "만화", displayOrder: 15 },
];

const SEED_QUESTIONS = [
  // ── 역사 ──
  {
    text: "1446년 조선 제4대 임금이 백성들이 글을 몰라 자신의 뜻을 표현하지 못하는 것을 안타까워하여 새로운 문자를 창제하고 이를 '훈민정음'이라 이름 지었습니다. 이 문자를 창제한 왕의 이름은 무엇일까요?",
    answers: ["세종대왕", "세종", "이도"],
    category: "역사",
    difficulty: 1,
  },
  {
    text: "1592년 일본이 20만 대군을 이끌고 조선을 침략하자, 전라좌수사 이순신 장군이 거북선을 앞세워 연전연승하며 나라를 지켰습니다. 이 전쟁을 한자로 '임진년에 일어난 난리'라는 뜻으로 무엇이라 부를까요?",
    answers: ["임진왜란"],
    category: "역사",
    difficulty: 2,
  },
  {
    text: "1919년 3월 1일, 일제 강점기 아래 있던 한민족이 독립을 선언하고 전국 각지에서 만세 운동을 벌였습니다. 당시 민족대표 33인이 독립선언서를 낭독한 이 역사적인 사건의 이름은 무엇일까요?",
    answers: ["3.1운동", "삼일운동", "3·1운동", "31운동"],
    category: "역사",
    difficulty: 1,
  },
  {
    text: "고대 이집트인들이 약 4,500년 전에 파라오의 무덤으로 건설한 거대한 석조 건축물로, 기자 지역에 위치한 세 개의 구조물 중 가장 큰 것은 쿠푸 왕의 것입니다. 이 건축물의 이름은 무엇일까요?",
    answers: ["피라미드"],
    category: "역사",
    difficulty: 1,
  },
  {
    text: "프랑스 혁명 당시 파리 시민들이 1789년 7월 14일에 정치범을 가두던 감옥을 습격하면서 혁명이 본격화되었습니다. 매년 프랑스 국경일로 기념되는 이 사건에서 습격당한 감옥의 이름은 무엇일까요?",
    answers: ["바스티유", "바스티유감옥"],
    category: "역사",
    difficulty: 3,
  },
  {
    text: "1950년 6월 25일 새벽, 북한군이 38선 전역에 걸쳐 기습 남침을 감행하면서 시작된 이 전쟁은 3년간 계속되다 1953년 7월 27일 휴전 협정으로 멈추었습니다. 이 전쟁의 이름은 무엇일까요?",
    answers: ["한국전쟁", "6.25전쟁", "625전쟁", "6·25전쟁"],
    category: "역사",
    difficulty: 1,
  },
  {
    text: "중국 진나라의 시황제가 북방 유목민족의 침입을 막기 위해 기존의 성벽들을 연결하여 쌓은 거대한 방어 구조물로, 그 길이가 수천 킬로미터에 달하는 이 건축물의 이름은 무엇일까요?",
    answers: ["만리장성"],
    category: "역사",
    difficulty: 1,
  },
  {
    text: "1945년 8월 15일, 일본 천황이 라디오 방송을 통해 무조건 항복을 선언하면서 한반도는 35년간의 일제 식민 지배에서 벗어나게 되었습니다. 이 날을 우리는 무엇이라 부를까요?",
    answers: ["광복절"],
    category: "역사",
    difficulty: 1,
  },

  // ── 과학 ──
  {
    text: "아이작 뉴턴이 사과나무에서 사과가 떨어지는 것을 보고 영감을 얻었다는 일화로 유명한 이 법칙은, 질량을 가진 모든 물체 사이에 인력이 작용한다는 것을 설명합니다. 이 법칙을 무엇이라 할까요?",
    answers: ["만유인력의법칙", "만유인력", "중력의법칙"],
    category: "과학",
    difficulty: 2,
  },
  {
    text: "수소 원자 두 개와 산소 원자 한 개가 결합하여 만들어지는 이 물질은 지구 표면의 약 71%를 덮고 있으며, 생명체의 생존에 필수적입니다. 이 물질의 화학식을 알파벳과 숫자로 쓰면 무엇일까요?",
    answers: ["H2O"],
    category: "과학",
    difficulty: 1,
  },
  {
    text: "태양계의 여덟 개 행성 중에서 지름이 약 14만 킬로미터로 가장 크고, 거대한 붉은 반점이라 불리는 초대형 폭풍이 수백 년째 불고 있는 이 가스 행성의 이름은 무엇일까요?",
    answers: ["목성", "주피터", "Jupiter"],
    category: "과학",
    difficulty: 1,
  },
  {
    text: "1905년 알베르트 아인슈타인이 발표한 특수 상대성 이론의 핵심 공식으로, 에너지는 질량에 빛의 속도의 제곱을 곱한 것과 같다는 것을 나타냅니다. 이 유명한 공식을 알파벳으로 쓰면 무엇일까요?",
    answers: ["E=mc2", "E=MC2", "E=mc²"],
    category: "과학",
    difficulty: 2,
  },
  {
    text: "인간의 몸속에서 산소를 운반하는 적혈구를 만들고, 면역을 담당하는 백혈구를 생산하며, 혈소판으로 지혈을 돕는 이 붉은 액체 조직은 심장의 펌프 작용으로 온몸을 순환합니다. 이것은 무엇일까요?",
    answers: ["혈액", "피"],
    category: "과학",
    difficulty: 1,
  },
  {
    text: "약 46억 년 전에 형성되어 현재까지 우리가 살고 있는 이 행성은 태양에서 세 번째로 가까우며, 표면의 약 71%가 물로 덮여 있어 우주에서 보면 푸른색으로 보입니다. 이 행성의 이름은 무엇일까요?",
    answers: ["지구"],
    category: "과학",
    difficulty: 1,
  },
  {
    text: "찰스 다윈이 비글호를 타고 갈라파고스 제도를 탐험한 뒤, 생물이 환경에 적응하며 변화해 간다는 이론을 정립했습니다. 자연선택에 의해 생물이 변화한다는 이 이론의 이름은 무엇일까요?",
    answers: ["진화론", "자연선택설", "진화"],
    category: "과학",
    difficulty: 2,
  },
  {
    text: "원자번호 79번으로 화학 기호 Au를 사용하며, 인류 역사에서 화폐와 장신구의 재료로 널리 사용되어 온 이 귀금속은 노란 빛을 띄는 것이 특징입니다. 이 금속의 이름은 무엇일까요?",
    answers: ["금", "골드", "Gold"],
    category: "과학",
    difficulty: 1,
  },
  {
    text: "지구의 대기권 밖 약 100km 이상의 공간으로, 공기가 거의 없어 소리가 전달되지 않으며, 인공위성과 국제우주정거장이 돌고 있는 이 공간을 무엇이라 할까요?",
    answers: ["우주", "우주공간", "외기권"],
    category: "과학",
    difficulty: 1,
  },

  // ── 지리 ──
  {
    text: "한반도의 중심부에 위치하며 한강이 가로지르는 이 도시는 대한민국의 수도로서, 약 1,000만 명의 인구가 거주하고 있으며 경복궁, 남산타워 등의 랜드마크가 있습니다. 이 도시의 이름은 무엇일까요?",
    answers: ["서울", "서울특별시"],
    category: "지리",
    difficulty: 1,
  },
  {
    text: "세계에서 가장 높은 산으로 해발 8,849미터에 달하며, 히말라야 산맥에 위치하고 있습니다. 네팔에서는 '사가르마타', 티베트에서는 '초모랑마'라고 부르는 이 산의 영어 이름은 무엇일까요?",
    answers: ["에베레스트", "에베레스트산", "Mount Everest"],
    category: "지리",
    difficulty: 1,
  },
  {
    text: "아프리카 대륙 동북부를 흐르는 세계에서 가장 긴 강으로 길이가 약 6,650km에 달하며, 고대 이집트 문명의 발상지가 되었습니다. 매년 범람하여 비옥한 토양을 만들어주었던 이 강의 이름은 무엇일까요?",
    answers: ["나일강", "나일"],
    category: "지리",
    difficulty: 2,
  },
  {
    text: "남아메리카 대륙에 위치한 세계에서 가장 넓은 열대우림으로, '지구의 허파'라 불리며 수많은 동식물 종이 서식하고 있습니다. 같은 이름의 강이 이 숲을 관통하여 흐르는데, 이 열대우림의 이름은 무엇일까요?",
    answers: ["아마존", "아마존열대우림", "아마존밀림"],
    category: "지리",
    difficulty: 2,
  },
  {
    text: "유럽 대륙의 남서부에 위치한 이 나라는 투우와 플라멩코 춤으로 유명하며, 수도는 마드리드입니다. 과거 무적함대를 보유했던 해양 강국이었으며, 축구 클럽 FC 바르셀로나와 레알 마드리드의 본거지이기도 한 이 나라는 어디일까요?",
    answers: ["스페인", "에스파냐", "Spain"],
    category: "지리",
    difficulty: 1,
  },
  {
    text: "오세아니아에 위치한 섬나라이자 대륙으로, 캥거루와 코알라 등 독특한 유대류 동물이 서식하며 시드니 오페라하우스가 유명한 관광 명소입니다. 수도는 캔버라인 이 나라의 이름은 무엇일까요?",
    answers: ["호주", "오스트레일리아", "Australia"],
    category: "지리",
    difficulty: 1,
  },

  // ── 문학·예술 ──
  {
    text: "영국의 극작가 윌리엄 셰익스피어가 쓴 비극으로, 덴마크의 왕자가 아버지를 독살한 숙부에게 복수하는 내용을 담고 있으며, '사느냐 죽느냐, 그것이 문제로다'라는 유명한 독백이 나오는 이 작품의 제목은 무엇일까요?",
    answers: ["햄릿", "Hamlet"],
    category: "문학",
    difficulty: 2,
  },
  {
    text: "이탈리아 르네상스 시대의 거장 레오나르도 다 빈치가 그린 초상화로, 프랑스 파리의 루브르 박물관에 전시되어 있으며 신비로운 미소로 세계에서 가장 유명한 그림으로 꼽히는 이 작품의 이름은 무엇일까요?",
    answers: ["모나리자", "모나 리자", "Mona Lisa"],
    category: "예술",
    difficulty: 1,
  },
  {
    text: "독일의 작곡가 루트비히 판 베토벤이 청력을 거의 잃은 상태에서 작곡한 교향곡으로, 마지막 악장에 실러의 시 '환희의 송가'를 합창으로 넣은 것으로 유명합니다. 그의 마지막 교향곡인 이 곡의 번호는 몇 번일까요?",
    answers: ["9번", "9", "교향곡9번"],
    category: "예술",
    difficulty: 2,
  },
  {
    text: "J.K.롤링이 쓴 판타지 소설 시리즈로, 이마에 번개 모양 흉터가 있는 소년 마법사가 호그와트 마법학교에 입학하여 악의 마법사 볼드모트와 싸우는 내용입니다. 이 주인공의 이름은 무엇일까요?",
    answers: ["해리포터", "해리 포터", "Harry Potter"],
    category: "문학",
    difficulty: 1,
  },
  {
    text: "노르웨이 화가 에드바르 뭉크가 1893년에 그린 작품으로, 붉은 하늘 아래 다리 위에서 양손으로 볼을 감싸며 공포에 질린 표정을 짓고 있는 인물을 그린 이 그림의 제목은 무엇일까요?",
    answers: ["절규", "비명", "The Scream"],
    category: "예술",
    difficulty: 2,
  },

  // ── 수학 ──
  {
    text: "원의 둘레를 지름으로 나눈 값으로, 소수점 아래로 무한히 계속되는 무리수입니다. 그리스 문자로 표기하며 약 3.14159로 시작하는 이 수학 상수의 이름은 무엇일까요?",
    answers: ["파이", "원주율", "π", "pi"],
    category: "수학",
    difficulty: 1,
  },
  {
    text: "고대 그리스의 수학자가 발견한 정리로, 직각삼각형에서 빗변의 제곱은 나머지 두 변의 제곱의 합과 같다는 것을 증명했습니다. 이 유명한 정리에 이름을 남긴 수학자는 누구일까요?",
    answers: ["피타고라스", "Pythagoras"],
    category: "수학",
    difficulty: 2,
  },
  {
    text: "1, 1, 2, 3, 5, 8, 13, 21처럼 앞의 두 수를 더하면 다음 수가 되는 규칙을 가진 이 수열은 자연계의 꽃잎 수, 소용돌이 모양 등에서 자주 발견됩니다. 이탈리아 수학자의 이름을 딴 이 수열의 이름은 무엇일까요?",
    answers: ["피보나치수열", "피보나치", "Fibonacci"],
    category: "수학",
    difficulty: 2,
  },

  // ── 스포츠 ──
  {
    text: "4년마다 개최되는 세계 최대의 국제 스포츠 대회로, 고대 그리스 올림피아에서 시작되었으며 1896년 아테네에서 근대 대회가 부활했습니다. 다섯 개의 색깔 고리가 서로 겹친 것이 상징인 이 대회의 이름은 무엇일까요?",
    answers: ["올림픽", "올림픽경기대회", "Olympics"],
    category: "스포츠",
    difficulty: 1,
  },
  {
    text: "11명으로 구성된 두 팀이 90분 동안 발로 공을 차서 상대방 골대에 넣는 것으로 승부를 가리는 스포츠로, 4년마다 열리는 FIFA 월드컵이 가장 큰 대회입니다. 전 세계에서 가장 인기 있는 이 스포츠의 이름은 무엇일까요?",
    answers: ["축구", "풋볼", "soccer", "football"],
    category: "스포츠",
    difficulty: 1,
  },
  {
    text: "대한민국의 프로야구 리그에서 활약했으며, 미국 메이저리그 LA 다저스에서 뛰며 아시아 최초로 메이저리그 MVP를 수상한 한국 출신 투수가 있습니다. 이 선수의 이름이 아니라, 이 선수의 등번호가 99번인 현재 LA다저스 소속 일본 출신 야구 선수의 이름은 무엇일까요?",
    answers: ["류현진"],
    category: "스포츠",
    difficulty: 3,
  },

  // ── 상식·문화 ──
  {
    text: "대한민국에서 매년 음력 8월 15일에 지내는 명절로, 한 해 농사의 수확을 감사하며 송편을 만들어 먹고 차례를 지내는 풍습이 있습니다. '한가위'라고도 불리는 이 명절의 이름은 무엇일까요?",
    answers: ["추석", "한가위"],
    category: "문화",
    difficulty: 1,
  },
  {
    text: "커피 원두를 곱게 갈아 고압의 뜨거운 물을 통과시켜 추출하는 이탈리아식 커피로, 카페라떼, 카푸치노, 아메리카노 등 다양한 커피 음료의 베이스가 됩니다. 이탈리아어로 '빠른'이라는 뜻을 가진 이 커피의 이름은 무엇일까요?",
    answers: ["에스프레소", "espresso"],
    category: "문화",
    difficulty: 2,
  },
  {
    text: "일본에서 유래한 음식으로, 식초를 섞은 밥 위에 신선한 생선회를 올려 만드는 요리입니다. 한국에서도 회전 벨트 위에 접시를 올려 제공하는 식당이 인기인데, 이 음식의 이름은 무엇일까요?",
    answers: ["초밥", "스시", "sushi"],
    category: "문화",
    difficulty: 1,
  },

  // ── IT·기술 ──
  {
    text: "1976년 스티브 잡스와 스티브 워즈니악이 캘리포니아 차고에서 공동 창립한 회사로, 아이폰, 아이패드, 맥북 등의 제품으로 유명하며 한때 세계에서 시가총액이 가장 높은 기업이 되었습니다. 이 회사의 이름은 무엇일까요?",
    answers: ["애플", "Apple"],
    category: "IT",
    difficulty: 1,
  },
  {
    text: "1969년 미국 국방부의 연구 프로젝트 ARPANET에서 시작되어, 현재 전 세계 수십억 명이 사용하는 글로벌 컴퓨터 네트워크로 발전했습니다. 웹 브라우저를 통해 정보를 검색하고 소통할 수 있게 해주는 이것의 이름은 무엇일까요?",
    answers: ["인터넷", "Internet"],
    category: "IT",
    difficulty: 1,
  },
  {
    text: "2004년 마크 저커버그가 하버드대학교 기숙사에서 개발한 소셜 네트워크 서비스로, 전 세계 약 30억 명의 월간 활성 사용자를 보유하고 있으며, 2021년에 회사명을 메타로 변경했습니다. 이 SNS의 원래 이름은 무엇일까요?",
    answers: ["페이스북", "Facebook"],
    category: "IT",
    difficulty: 1,
  },
  {
    text: "2022년 말 OpenAI가 공개하여 전 세계적으로 큰 화제가 된 대화형 인공지능 서비스로, 사용자의 질문에 자연어로 대답하고 글을 작성하며 코딩까지 할 수 있습니다. 두 달 만에 1억 명의 사용자를 돌파한 이 서비스의 이름은 무엇일까요?",
    answers: ["ChatGPT", "챗GPT", "챗지피티"],
    category: "IT",
    difficulty: 1,
  },

  // ── 영화·엔터테인먼트 ──
  {
    text: "2019년 봉준호 감독이 연출하고 송강호가 주연한 한국 영화로, 반지하에 사는 가난한 가족이 부유한 가족의 집에 하나씩 취직하면서 벌어지는 이야기를 그렸습니다. 아카데미 작품상을 수상한 이 영화의 제목은 무엇일까요?",
    answers: ["기생충", "Parasite"],
    category: "영화",
    difficulty: 1,
  },
  {
    text: "1977년 조지 루카스 감독이 시작한 SF 영화 시리즈로, '포스'라 불리는 신비한 에너지를 사용하는 제다이 기사단과 은하제국의 대결을 그립니다. '루크, 나는 네 아버지다'라는 대사로 유명한 이 시리즈의 이름은 무엇일까요?",
    answers: ["스타워즈", "Star Wars"],
    category: "영화",
    difficulty: 1,
  },
  {
    text: "월트 디즈니가 1928년에 처음 만든 캐릭터로, 빨간 반바지와 노란 신발, 흰 장갑을 끼고 있는 것이 특징인 이 쥐 캐릭터는 디즈니의 상징이 되었습니다. 전 세계에서 가장 유명한 이 캐릭터의 이름은 무엇일까요?",
    answers: ["미키마우스", "미키 마우스", "Mickey Mouse"],
    category: "엔터테인먼트",
    difficulty: 1,
  },

  // ── 음식 ──
  {
    text: "이탈리아 나폴리에서 유래한 음식으로, 밀가루 반죽을 얇고 둥글게 펴서 토마토 소스를 바르고 모차렐라 치즈와 다양한 토핑을 올린 뒤 오븐에 구워 만듭니다. 전 세계적으로 사랑받는 이 음식의 이름은 무엇일까요?",
    answers: ["피자", "Pizza"],
    category: "음식",
    difficulty: 1,
  },
  {
    text: "대한민국을 대표하는 발효 식품으로, 배추나 무 등의 채소를 고춧가루, 마늘, 젓갈 등의 양념에 버무려 숙성시킨 것입니다. 2013년 유네스코 인류무형문화유산에 등재된 '이것을 담그는 문화'로도 유명한 이 음식은 무엇일까요?",
    answers: ["김치", "kimchi"],
    category: "음식",
    difficulty: 1,
  },

  // ── 동물·자연 ──
  {
    text: "중국 쓰촨성의 대나무 숲에서 주로 서식하며, 검은색과 흰색의 독특한 무늬를 가진 이 곰과 동물은 하루에 약 12~38kg의 대나무를 먹습니다. 세계자연기금(WWF)의 로고에도 사용된 이 동물의 이름은 무엇일까요?",
    answers: ["판다", "자이언트판다", "대왕판다"],
    category: "동물",
    difficulty: 1,
  },
  {
    text: "아프리카 사바나에서 무리를 지어 생활하며, 수컷은 목 주위에 풍성한 갈기를 가지고 있어 '백수의 왕'이라 불리는 이 대형 고양이과 동물은 먹이사슬의 최상위 포식자입니다. 이 동물의 이름은 무엇일까요?",
    answers: ["사자", "lion"],
    category: "동물",
    difficulty: 1,
  },
  {
    text: "바다에서 가장 큰 동물로 몸길이가 최대 30미터, 몸무게가 약 150톤에 달하는 이 포유류는 새끼에게 젖을 먹이며 수면 위로 올라와 숨을 쉽니다. 심장 크기만으로도 소형차만 한 이 동물의 이름은 무엇일까요?",
    answers: ["대왕고래", "흰수염고래", "블루웨일", "대왕수염고래"],
    category: "동물",
    difficulty: 2,
  },

  // ── 게임·만화 ──
  {
    text: "일본 닌텐도가 개발한 게임 시리즈로, 빨간 모자와 파란 멜빵바지를 입은 이탈리아 배관공이 쿠파에게 납치된 피치 공주를 구하기 위해 버섯 왕국을 모험합니다. 이 게임의 주인공 이름은 무엇일까요?",
    answers: ["마리오", "슈퍼마리오", "Mario"],
    category: "게임",
    difficulty: 1,
  },
  {
    text: "1996년 일본에서 처음 출시된 닌텐도의 RPG 게임 시리즈로, 야생에서 다양한 몬스터를 포획하여 훈련시키고 배틀하는 것이 핵심 게임플레이입니다. 피카츄가 대표 캐릭터인 이 게임 시리즈의 이름은 무엇일까요?",
    answers: ["포켓몬", "포켓몬스터", "Pokemon"],
    category: "게임",
    difficulty: 1,
  },
  {
    text: "에이이치로 오다가 1997년부터 소년 점프에 연재 중인 일본 만화로, 고무고무 열매를 먹어 몸이 고무처럼 늘어나는 루피가 해적왕을 꿈꾸며 동료들과 모험을 떠나는 이야기입니다. 이 만화의 제목은 무엇일까요?",
    answers: ["원피스", "One Piece"],
    category: "만화",
    difficulty: 1,
  },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("기존 데이터 초기화...");
  await db.delete(playRecords);
  await db.delete(questions);
  await db.delete(categories);

  console.log("카테고리 시드 삽입...");
  const categoryMap = new Map<string, string>();
  for (const cat of SEED_CATEGORIES) {
    const [inserted] = await db.insert(categories).values(cat).returning();
    categoryMap.set(cat.name, inserted.id);
    console.log(`  카테고리 추가: ${cat.name}`);
  }

  console.log("문제 시드 삽입...");
  for (const q of SEED_QUESTIONS) {
    const categoryId = categoryMap.get(q.category) ?? null;
    const [inserted] = await db.insert(questions).values({
      text: q.text,
      answers: q.answers,
      categoryId,
      difficulty: q.difficulty,
    }).returning();
    console.log(`  문제 추가: ${q.text.slice(0, 30)}...`);

    const len = q.text.length;
    const ghostProfiles = [
      { name: "고스트A", ratio: 0.25, correctRate: 0.85 },
      { name: "고스트B", ratio: 0.5, correctRate: 0.7 },
      { name: "고스트C", ratio: 0.75, correctRate: 0.55 },
    ];

    for (const ghost of ghostProfiles) {
      const charIdx = Math.max(1, Math.round(len * ghost.ratio));
      const isCorrect = Math.random() < ghost.correctRate;
      await db.insert(playRecords).values({
        questionId: inserted.id,
        userName: ghost.name,
        buzzCharIndex: charIdx,
        buzzTimeMs: charIdx * CHAR_INTERVAL_MS + Math.floor(Math.random() * 500),
        answerTimeMs: 1500 + Math.floor(Math.random() * 2000),
        isCorrect,
        normalizedAnswer: isCorrect
          ? q.answers[0].toLowerCase().replace(/\s+/g, "")
          : "오답",
      });
    }
  }

  console.log(`\n완료! 카테고리 ${SEED_CATEGORIES.length}개, 문제 ${SEED_QUESTIONS.length}개, 고스트 ${SEED_QUESTIONS.length * 3}개 삽입.`);
}

seed().catch(console.error);
