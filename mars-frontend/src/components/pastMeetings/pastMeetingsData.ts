import type { PastMeeting, PastMeetingDetail } from './types';

export const pastMeetings: PastMeeting[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
    title: 'MARS 초기 아이디어 회의',
    date: '2026-04-12',
    actionItems: 5,
    completed: 5,
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
    title: 'MARS 기획안 발표 자료 회의',
    date: '2026-04-10',
    actionItems: 10,
    completed: 10,
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa3',
    title: '역할 분배 및 진행 상황 보고',
    date: '2026-04-08',
    actionItems: 6,
    completed: 6,
  },
];

export const pastMeetingDetails: Record<string, PastMeetingDetail> = {
  '3fa85f64-5717-4562-b3fc-2c963f66afa1': {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
    project_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'MARS 초기 아이디어 회의',
    purpose: 'MARS 서비스의 핵심 문제 정의와 초기 기능 범위를 정리합니다.',
    raw_text:
      '회의에서는 회의록 입력, 액션 아이템 추출, 담당자 지정, 진행 현황 추적 흐름을 중심으로 초기 아이디어를 논의했습니다.',
    summary:
      'MARS는 회의 후 실행력을 높이기 위해 회의록에서 액션 아이템을 추출하고 담당자와 마감일을 관리하는 방향으로 정리되었습니다. 우선 회의 입력, 액션 아이템 관리, 지난 회의 조회를 핵심 화면으로 두기로 했습니다.',
    qualitative_feedback:
      '회의 목적과 산출물이 명확했고, 핵심 화면 범위를 빠르게 합의했습니다. 다만 백엔드 API 응답 형식과 프론트 상태 모델을 더 일찍 맞추면 이후 구현 속도가 더 좋아질 수 있습니다.',
    productivity_score: 86,
    created_at: '2026-05-17T06:41:52.829Z',
    actionItems: 5,
    completed: 5,
    next_agenda: ['액션 아이템 관리 화면 구현 범위 점검'],
  },
  '3fa85f64-5717-4562-b3fc-2c963f66afa2': {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
    project_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'MARS 기획안 발표 자료 회의',
    purpose: '발표 자료 구성과 시연 흐름을 확정합니다.',
    raw_text:
      '팀은 문제 배경, 핵심 기능, 사용자 플로우, 데모 화면 순서에 대해 논의하고 발표 담당자를 나누었습니다.',
    summary:
      '발표 자료는 문제 정의, 기능 소개, 화면 시연, 향후 개선 방향 순서로 구성하기로 했습니다. 데모에서는 회의 입력부터 액션 아이템 생성과 지난 회의 조회까지 자연스럽게 보여주기로 했습니다.',
    qualitative_feedback:
      '발표 흐름은 잘 정리되었지만 각 슬라이드의 메시지 밀도가 조금 높습니다. 핵심 문장을 줄이고 화면 시연에 시간을 더 배분하면 설득력이 높아질 것입니다.',
    productivity_score: 78,
    created_at: '2026-05-17T06:41:52.829Z',
    actionItems: 10,
    completed: 10,
    next_agenda: ['발표 자료 시연 흐름 최종 확인'],
  },
  '3fa85f64-5717-4562-b3fc-2c963f66afa3': {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa3',
    project_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: '역할 분배 및 진행 상황 보고',
    purpose: '팀원별 담당 영역과 남은 구현 범위를 점검합니다.',
    raw_text:
      '프론트엔드 화면 구현, 백엔드 API 정리, 발표 자료 준비, 테스트 담당을 나누고 각자 진행 현황을 공유했습니다.',
    summary:
      '역할 분배가 명확해졌고 남은 구현 범위가 정리되었습니다. 액션 아이템 페이지, 지난 회의 페이지, API 연결부를 우선 마무리하기로 했습니다.',
    qualitative_feedback:
      '담당자와 마감일이 구체적으로 정리되어 실행 가능성이 높습니다. 다음 회의에서는 완료 기준과 테스트 범위를 더 구체화하면 좋습니다.',
    productivity_score: 91,
    created_at: '2026-05-17T06:41:52.829Z',
    actionItems: 6,
    completed: 6,
    next_agenda: ['남은 구현 범위와 테스트 계획 공유'],
  },
};
