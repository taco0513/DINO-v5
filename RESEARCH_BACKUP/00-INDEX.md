# DINO v4 Research Documents Index

## 📚 Research Documents Overview

이 폴더는 DINO v4 개발 과정에서 축적된 모든 연구 자료와 기술 문서를 포함합니다.
새 프로젝트를 시작할 때 참고할 수 있는 핵심 정보들입니다.

## 📁 Document Structure

### 1. **MASTER_PLAYBOOK.md**
- 전체 프로젝트 개요
- 기술 스택 결정 사항
- 아키텍처 설계
- 비즈니스 모델
- 로드맵 및 향후 계획

### 2. **database-schema.sql**
- 완성된 데이터베이스 스키마
- 테이블 구조
- 인덱스 및 관계
- Row Level Security 정책
- 저장 프로시저 및 함수

### 3. **visa-logic-research.md**
- 비자 계산 로직
- Schengen 90/180 규칙
- 세금 거주지 183일 규칙
- 국가별 특수 규칙
- 계산 알고리즘 및 예외 처리

### 4. **design-system.md**
- 색상 팔레트
- 타이포그래피 시스템
- 간격 및 레이아웃 규칙
- 컴포넌트 패턴
- 접근성 가이드라인
- 다크 모드 준비

### 5. **api-architecture.md**
- RESTful API 설계
- 엔드포인트 목록
- 요청/응답 형식
- 인증 플로우
- 에러 코드 체계
- Rate limiting 전략

## 🔑 Key Learnings

### 기술적 결정사항
1. **Next.js 14 App Router**: 최신 React 패턴과 서버 컴포넌트 활용
2. **Supabase**: 실시간 기능과 Row Level Security로 보안 강화
3. **TypeScript**: 타입 안정성으로 버그 감소
4. **Tailwind CSS**: 빠른 개발과 일관된 디자인

### 중요한 구현 세부사항
1. **SSG vs SSR**: `export const dynamic = 'force-dynamic'` 필요
2. **Google OAuth**: Redirect URL 설정 주의
3. **Bundle 최적화**: Dynamic imports로 32% 크기 감소
4. **PWA 설정**: Service Worker와 manifest.json 구성

### 피해야 할 실수들
1. Supabase 초기화 시 환경 변수 확인
2. TypeScript strict mode에서 implicit any 에러
3. Cookie 사용 시 SSG 빌드 실패
4. DNS 설정 시 Google Workspace 충돌

## 💡 Best Practices

### 개발 워크플로우
```bash
# 1. 기능 개발
git checkout -b feature/new-feature
npm run dev

# 2. 테스트
npm run test
npm run lint

# 3. 빌드 확인
npm run build

# 4. 배포
git push origin main
vercel --prod
```

### 코드 구조
```
app/
├── api/v1/         # API 라우트
├── (auth)/         # 인증 페이지
├── (dashboard)/    # 메인 앱
└── layout.tsx      # 루트 레이아웃

components/
├── ui/            # 재사용 컴포넌트
├── features/      # 기능별 컴포넌트
└── layouts/       # 레이아웃 컴포넌트

lib/
├── utils/         # 유틸리티 함수
├── services/      # API 서비스
├── hooks/         # 커스텀 훅
└── types/         # TypeScript 타입
```

## 🚀 Quick Start for New Project

```bash
# 1. 프로젝트 생성
npx create-next-app@latest dino-new --typescript --tailwind --app

# 2. 필수 패키지 설치
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install date-fns react-hook-form sonner
npm install -D @types/node

# 3. 환경 변수 설정
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 📈 Performance Targets

- **Load Time**: < 3초 (3G)
- **Bundle Size**: < 200KB (initial)
- **Lighthouse Score**: 90+
- **Test Coverage**: 80%+
- **TypeScript Coverage**: 100%

## 🔒 Security Checklist

- [ ] Environment variables 보호
- [ ] Row Level Security 활성화
- [ ] Input validation (Zod)
- [ ] Rate limiting 구현
- [ ] CORS 설정
- [ ] Security headers
- [ ] SQL injection 방지
- [ ] XSS protection

## 📝 Notes

이 문서들은 DINO v4 개발 과정에서 얻은 모든 지식과 경험을 담고 있습니다.
새 프로젝트를 시작할 때 이 문서들을 참고하면 같은 실수를 반복하지 않고
더 빠르고 효율적으로 개발할 수 있습니다.

---

**Last Updated**: 2024-08-06
**Version**: 1.0.0
**Author**: DINO Development Team