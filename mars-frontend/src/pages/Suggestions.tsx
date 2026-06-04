import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProposedAgendas } from '../lib/api';
import type { AgendaResponse } from '../lib/api';
import { formatKoreanDate } from '../lib/date';
import { getStoredProjectContext } from '../lib/projectContext';

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  sourceMeetingId: string;
}

function Suggestions() {
  const navigate = useNavigate();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const storedProjectContext = getStoredProjectContext();
  const projectId = storedProjectContext?.projectId ?? '';
  const projectContextErrorMessage = !projectId
    ? '프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.'
    : '';

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let isMounted = true;

    const loadAgendas = async () => {
      setIsLoading(true);
      setMessage('');

      try {
        const agendas = await getProposedAgendas(projectId);
        const items = agendas.flatMap(toAgendaItems);

        if (!isMounted) {
          return;
        }

        setAgendaItems(items);
        setMessage(items.length > 0 ? '' : '아직 생성된 차기 안건이 없습니다.');
      } catch (error) {
        console.error('[Suggestions][LoadFailed]', {
          projectId,
          error,
        });

        if (!isMounted) {
          return;
        }

        setAgendaItems([]);
        setMessage('차기 안건을 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAgendas();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleStartMeeting = (item: AgendaItem) => {
    if (item.sourceMeetingId) {
      navigate('/meetings/past', {
        state: {
          selectedMeetingId: item.sourceMeetingId,
        },
      });
      return;
    }

    navigate('/meetings', {
      state: {
        meetingDraft: {
          title: '',
          purpose: item.title,
          rawText: '',
        },
      },
    });
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-2xl text-primary">제안</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            생성된 차기 회의 안건을 확인하고 바로 회의 입력으로 이어가세요.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h2 className="text-lg text-foreground">차기 안건</h2>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {agendaItems.length}개
            </div>
          </div>

          {(message || projectContextErrorMessage) ? (
            <p className={(message || projectContextErrorMessage).includes('못했습니다') || projectContextErrorMessage ? 'text-sm text-primary' : 'text-sm text-muted-foreground'}>
              {projectContextErrorMessage || message}
            </p>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-border bg-secondary/50 p-8 text-sm text-muted-foreground">
              차기 안건을 불러오는 중입니다.
            </div>
          ) : agendaItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
              아직 생성된 차기 안건이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agendaItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-secondary px-4 py-3 transition hover:border-primary/50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug text-foreground">{item.title}</h3>
                    {item.description && item.description !== item.title ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      생성일 {formatKoreanDate(item.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-muted hover:text-primary"
                    onClick={() => handleStartMeeting(item)}
                  >
                    {item.sourceMeetingId ? '지난 회의 기록 보기' : '이 안건으로 회의하기'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const toAgendaItems = (agenda: AgendaResponse): AgendaItem[] => {
  return agenda.proposed_agendas.map((rawAgenda, index) => {
    const parsedAgenda = parseAgenda(rawAgenda);
    const sourceMeetingId = parsedAgenda.sourceMeetingId || getAgendaSourceMeetingId(agenda);

    return {
      id: `${agenda.id}-${index}`,
      title: parsedAgenda.title || `차기 안건 ${index + 1}`,
      description: parsedAgenda.description,
      createdAt: agenda.created_at ?? '',
      sourceMeetingId,
    };
  });
};

const parseAgenda = (agenda: unknown) => {
  if (typeof agenda === 'string') {
    return {
      title: agenda,
      description: '',
      sourceMeetingId: '',
    };
  }

  if (agenda && typeof agenda === 'object') {
    const record = agenda as Record<string, unknown>;
    const title = toStringValue(record.title)
      || toStringValue(record.agenda)
      || toStringValue(record.name)
      || toStringValue(record.topic);
    const description = toStringValue(record.description)
      || toStringValue(record.summary)
      || toStringValue(record.detail)
      || title;
    const sourceMeetingId = toStringValue(record.meeting_id)
      || toStringValue(record.meetingId)
      || toStringValue(record.source_meeting_id)
      || toStringValue(record.sourceMeetingId);

    return {
      title,
      description,
      sourceMeetingId,
    };
  }

  return {
    title: '',
    description: '',
    sourceMeetingId: '',
  };
};

const getAgendaSourceMeetingId = (agenda: AgendaResponse) => {
  return agenda.meeting_id
    || agenda.meetingId
    || agenda.source_meeting_id
    || agenda.sourceMeetingId
    || '';
};

const toStringValue = (value: unknown) => {
  return typeof value === 'string' ? value : '';
};

export default Suggestions;
