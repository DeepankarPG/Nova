import { Image as ImageIcon, Link as LinkIcon, Video as VideoIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";

/** Renders the lightweight markup produced by PageDescriptionEditor as JSX. */
function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|!\[(.*?)\]\((.*?)\)|\[video\]\((.*?)\)|\[(.*?)\]\((.*?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(<span key={key++} className="underline">{match[3]}</span>);
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[6] !== undefined) {
      nodes.push(
        <span key={key++} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          {match[5] || "Image"}
        </span>
      );
    } else if (match[7] !== undefined) {
      nodes.push(
        <span key={key++} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          <VideoIcon className="h-3 w-3" />
          Video
        </span>
      );
    } else if (match[8] !== undefined) {
      nodes.push(
        <span key={key++} className="inline-flex items-center gap-1 text-primary underline">
          <LinkIcon className="h-3 w-3" />
          {match[8]}
        </span>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function renderPageDescription(description: string): ReactNode {
  if (!description.trim()) return null;
  const lines = description.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        if (/^- /.test(line)) {
          return (
            <p key={i} className="flex gap-1.5">
              <span>•</span>
              <span>{renderInline(line.slice(2))}</span>
            </p>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const stripped = line.replace(/^\d+\.\s/, "");
          return (
            <p key={i} className="flex gap-1.5">
              <span>{line.match(/^\d+/)?.[0]}.</span>
              <span>{renderInline(stripped)}</span>
            </p>
          );
        }
        return (
          <Fragment key={i}>
            <span>{renderInline(line)}</span>
            {i < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </>
  );
}
