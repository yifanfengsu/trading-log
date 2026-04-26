import NotesPage from "@/components/notes/NotesPage";
import type { NoteLink } from "@/lib/note-types";
import { isNoteDateKey } from "@/lib/note-types";

type NotesRouteSearchParams = Promise<{
  tradeId?: string | string[];
  date?: string | string[];
  playbookId?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitialLink(params: Awaited<NotesRouteSearchParams>): {
  link: NoteLink | null;
  key: string | null;
} {
  const tradeId = getSingleParam(params.tradeId)?.trim();

  if (tradeId) {
    return {
      link: { type: "trade", tradeId },
      key: `trade:${tradeId}`,
    };
  }

  const date = getSingleParam(params.date)?.trim();

  if (date && isNoteDateKey(date)) {
    return {
      link: { type: "date", date },
      key: `date:${date}`,
    };
  }

  const playbookId = getSingleParam(params.playbookId)?.trim();

  if (playbookId) {
    return {
      link: { type: "playbook", playbookId },
      key: `playbook:${playbookId}`,
    };
  }

  return {
    link: null,
    key: null,
  };
}

export default async function NotesRoutePage({
  searchParams,
}: {
  searchParams: NotesRouteSearchParams;
}) {
  const { link, key } = getInitialLink(await searchParams);

  return <NotesPage initialLink={link} initialLinkKey={key} />;
}
