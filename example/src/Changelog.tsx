import { Fragment } from 'react';
import changelogSource from '../../CHANGELOG.md?raw';

interface IRelease {
  version: string;
  date?: string;
  sections: { title: string; items: string[] }[];
}

// Reads the repo's CHANGELOG.md (Keep a Changelog layout), so the site and the file never drift apart.
const parseChangelog = (source: string) => {
  const releases: IRelease[] = [];
  const links: Record<string, string> = {};

  for (const line of source.split('\n')) {
    const link = line.match(/^\[([^\]]+)\]:\s*(\S+)/);
    const release = line.match(/^## \[([^\]]+)\](?:\s*-\s*(\S+))?/);
    const section = line.match(/^### (.+)/);
    const item = line.match(/^- (.+)/);
    const current = releases[releases.length - 1];

    if (link) links[link[1]] = link[2];
    else if (release) releases.push({ version: release[1], date: release[2], sections: [] });
    else if (section && current) current.sections.push({ title: section[1].trim(), items: [] });
    else if (item && current?.sections.length) current.sections[current.sections.length - 1].items.push(item[1]);
  }
  return { releases, links };
};

// Renders `code` and [text](url) inside a changelog line
const Inline = ({ text }: { text: string }) => (
  <>
    {text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, i) => {
      const code = part.match(/^`([^`]+)`$/);
      const anchor = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (code) return <code key={i}>{code[1]}</code>;
      if (anchor) return <a key={i} href={anchor[2]}>{anchor[1]}</a>;
      return <Fragment key={i}>{part}</Fragment>;
    })}
  </>
);

const { releases, links } = parseChangelog(changelogSource);

export default function Changelog() {
  return (
    <div className="releases">
      {releases.map((release) => (
        <article className="release" key={release.version} id={`v${release.version}`}>
          <h3>
            {links[release.version] ? <a href={links[release.version]}>{release.version}</a> : release.version}
            {release.date && <time dateTime={release.date}>{release.date}</time>}
          </h3>
          {release.sections.map((section) => (
            <Fragment key={section.title}>
              <h4 className={`tag tag-${section.title.toLowerCase()}`}>{section.title}</h4>
              <ul>
                {section.items.map((item, i) => (
                  <li key={i}><Inline text={item} /></li>
                ))}
              </ul>
            </Fragment>
          ))}
        </article>
      ))}
    </div>
  );
}
