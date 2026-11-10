import { useState } from 'react';
import "./App.css"
import { ISegments, ISpinWheelProps, SpinWheel } from '.';
import Changelog from './Changelog';
import { defaults, propDocs } from './docs';

const REPO = 'https://github.com/Ajay-Maury/spin-wheel-game';
const NPM = 'https://www.npmjs.com/package/spin-wheel-game';
const SITE = 'https://spin-wheel-game-rho.vercel.app/';

const starterSegments: ISegments[] = [
  { segmentText: "Try again", segColor: "#EE4040" },
  { segmentText: "Won 70", segColor: "#F0CF50" },
  { segmentText: "Won 10", segColor: "#815CD1" },
  { segmentText: "Try again", segColor: "#3DA5E0" },
  { segmentText: "Won 6", segColor: "#34A24F" },
  { segmentText: "Uber pass", segColor: "#34A246" },
];

const features = [
  { title: 'Random every time', text: 'Each spin lands on a uniformly random segment and reports it through onFinished.' },
  { title: 'Fully customizable', text: 'Any number of segments, each with its own text and color. Tune size, fonts, needle and timings.' },
  { title: 'Responsive', text: 'Shrinks to fit its container, so it works in cards, modals and on phones.' },
  { title: 'Tick sound', text: 'An optional ticking sound while the wheel spins. Turn it off with one prop.' },
  { title: 'TypeScript ready', text: 'Typings are bundled. React 18 and newer, with no other dependencies.' },
  { title: 'Safe by default', text: 'Bad sizes or durations fall back to defaults, and several wheels can share a page.' },
];

const usageCode = `import { SpinWheel } from 'spin-wheel-game';

const segments = [
  { segmentText: 'Option 1', segColor: 'red' },
  { segmentText: 'Option 2', segColor: 'blue' },
  { segmentText: 'Option 3', segColor: 'green' },
];

export default function MyWheel() {
  return (
    <SpinWheel
      segments={segments}
      onFinished={(result) => console.log(\`Spun to: \${result}\`)}
    />
  );
}`;

type Settings = Required<Omit<ISpinWheelProps, 'segments' | 'onFinished'>>;

const toCode = (segments: ISegments[], settings: Settings) => {
  const changed = (Object.keys(settings) as (keyof Settings)[]).filter((key) => settings[key] !== defaults[key]);
  const lines = changed.map((key) => {
    const value = settings[key];
    return typeof value === 'string' ? `  ${key}="${value}"` : `  ${key}={${value}}`;
  });
  const segmentLines = segments.map((s) => `  { segmentText: ${JSON.stringify(s.segmentText)}, segColor: ${JSON.stringify(s.segColor)} },`);
  return `const segments = [\n${segmentLines.join('\n')}\n];\n\n<SpinWheel\n  segments={segments}\n  onFinished={(result) => console.log(result)}${lines.length ? '\n' + lines.join('\n') : ''}\n/>`;
};

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => { /* clipboard may be unavailable */ });
  };
  return { copied, copy };
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useCopy(code);
  return (
    <div className="code">
      <div className="code-bar">
        <span>{label ?? 'tsx'}</span>
        <button type="button" onClick={copy} className="btn btn-small">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function InstallPill() {
  const command = 'npm install spin-wheel-game';
  const { copied, copy } = useCopy(command);
  return (
    <div className="pill">
      <code>$ {command}</code>
      <button type="button" onClick={copy} className="btn btn-small">{copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

function HeroWheel() {
  const [result, setResult] = useState('');
  return (
    <div className="hero-card">
      <SpinWheel segments={starterSegments} size={170} arrowLocation="top" showTextOnSpin={false} onFinished={setResult} />
      <p className="result" aria-live="polite">{result ? <>You got <strong>{result}</strong></> : 'Click the wheel to spin'}</p>
    </div>
  );
}

function Playground() {
  const [segments, setSegments] = useState<ISegments[]>(starterSegments);
  const [settings, setSettings] = useState<Settings>({ ...defaults, size: 170, arrowLocation: 'top' });
  const [result, setResult] = useState('');
  const [round, setRound] = useState(0); // changing the key resets a wheel locked by isOnlyOnce

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));
  const updateSegment = (i: number, patch: Partial<ISegments>) =>
    setSegments((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const number = (key: 'size' | 'upDuration' | 'downDuration') => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, Number(e.target.value));

  return (
    <div className="playground">
      <div className="stage-col">
        <div className="stage card">
          <SpinWheel
            key={round}
            segments={segments}
            onFinished={setResult}
            {...settings}
          />
          <p className="result" aria-live="polite">{result ? <>Result: <strong>{result}</strong></> : 'Click the wheel to spin'}</p>
          {settings.isOnlyOnce && <button type="button" className="btn" onClick={() => { setRound((r) => r + 1); setResult(''); }}>Reset wheel</button>}
        </div>
      </div>

      <div className="controls">
        <section className="card" aria-labelledby="pg-segments">
          <h3 id="pg-segments">Segments</h3>
          {segments.map((segment, i) => (
            <div className="segment-row" key={i}>
              <input aria-label={`Segment ${i + 1} text`} value={segment.segmentText} onChange={(e) => updateSegment(i, { segmentText: e.target.value })} />
              <input aria-label={`Segment ${i + 1} color`} type="color" value={segment.segColor} onChange={(e) => updateSegment(i, { segColor: e.target.value })} />
              <button type="button" className="btn btn-icon" aria-label={`Remove segment ${i + 1}`} disabled={segments.length <= 2} onClick={() => setSegments((list) => list.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="btn" disabled={segments.length >= 12} onClick={() => setSegments((list) => [...list, { segmentText: `option ${list.length + 1}`, segColor: '#888888' }])}>+ Add segment</button>
        </section>

        <section className="card" aria-labelledby="pg-look">
          <h3 id="pg-look">Look</h3>
          <label className="row">Wheel color <input type="color" value={settings.primaryColor.startsWith('#') ? settings.primaryColor : '#000000'} onChange={(e) => set('primaryColor', e.target.value)} /></label>
          <label className="row">Text color <input type="color" value={settings.contrastColor.startsWith('#') ? settings.contrastColor : '#ffffff'} onChange={(e) => set('contrastColor', e.target.value)} /></label>
          <label className="row">Button text <input value={settings.buttonText} onChange={(e) => set('buttonText', e.target.value)} /></label>
          <label className="row">Needle
            <select value={settings.arrowLocation} onChange={(e) => set('arrowLocation', e.target.value as Settings['arrowLocation'])}>
              <option value="center">center</option>
              <option value="top">top</option>
            </select>
          </label>
          <label className="row">Tick sound
            <select value={settings.tickSound} onChange={(e) => set('tickSound', e.target.value as Settings['tickSound'])}>
              <option value="wood">wood</option>
              <option value="coin">coin</option>
            </select>
          </label>
          <label className="row">Click to spin
            <select value={settings.clickToSpin} onChange={(e) => set('clickToSpin', e.target.value as Settings['clickToSpin'])}>
              <option value="wheel">wheel</option>
              <option value="button">button</option>
              <option value="none">none</option>
            </select>
          </label>
          <label className="row">Size <span className="range"><input type="range" min={100} max={290} value={settings.size} onChange={number('size')} /><output>{settings.size}</output></span></label>
        </section>

        <section className="card" aria-labelledby="pg-behavior">
          <h3 id="pg-behavior">Behavior</h3>
          <label className="row">Spin up <span className="range"><input type="range" min={0} max={400} step={10} value={settings.upDuration} onChange={number('upDuration')} /><output>{settings.upDuration}</output></span></label>
          <label className="row">Spin down <span className="range"><input type="range" min={100} max={1500} step={50} value={settings.downDuration} onChange={number('downDuration')} /><output>{settings.downDuration}</output></span></label>
          <div className="checks">
            <label><input type="checkbox" checked={settings.isOnlyOnce} onChange={(e) => set('isOnlyOnce', e.target.checked)} /> isOnlyOnce</label>
            <label><input type="checkbox" checked={settings.showTextOnSpin} onChange={(e) => set('showTextOnSpin', e.target.checked)} /> showTextOnSpin</label>
            <label><input type="checkbox" checked={settings.isSpinSound} onChange={(e) => set('isSpinSound', e.target.checked)} /> isSpinSound</label>
            <label><input type="checkbox" checked={settings.responsive} onChange={(e) => set('responsive', e.target.checked)} /> responsive</label>
          </div>
        </section>
      </div>

      <div className="snippet">
        <CodeBlock code={toCode(segments, settings)} label="Your code" />
      </div>
    </div>
  );
}

function Support() {
  const { copied, copy } = useCopy(SITE);
  return (
    <div className="card support">
      <div>
        <h2>Like it? Support it</h2>
        <p>spin-wheel-game is free and open source. If it saved you some time, a star on GitHub helps other developers find it, and it tells me it is worth keeping up.</p>
      </div>
      <div className="support-actions">
        <a className="btn btn-primary" href={REPO}>★ Star on GitHub</a>
        <button type="button" className="btn" onClick={copy}>{copied ? 'Link copied' : 'Share this page'}</button>
        <a className="btn" href={`${REPO}/issues`}>Report a bug or idea</a>
        <a className="btn" href={`${REPO}/blob/main/CONTRIBUTING.md`}>Contribute</a>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <header className="top">
        <div className="top-inner">
          <a className="brand" href="#top"><span className="logo" aria-hidden="true" />spin-wheel-game</a>
          <nav aria-label="Sections">
            <a href="#playground">Playground</a>
            <a href="#install">Install</a>
            <a href="#props">Props</a>
            <a href="#releases">Releases</a>
            <a className="btn btn-small" href={REPO}>GitHub</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-text">
            <span className="eyebrow">React component</span>
            <h1>A prize wheel for React</h1>
            <p className="lead">Drop in a customizable spin wheel for giveaways, raffles and random pickers. Click it and it spins, ticks, slows down and tells you which segment it landed on.</p>
            <InstallPill />
            <div className="cta">
              <a className="btn btn-primary" href="#playground">Try the playground</a>
              <a className="btn" href={REPO}>★ Star on GitHub</a>
            </div>
            <p className="badges">
              <a href={NPM}><img alt="npm version" src="https://img.shields.io/npm/v/spin-wheel-game.svg" /></a>
              <a href={NPM}><img alt="npm downloads" src="https://img.shields.io/npm/dm/spin-wheel-game.svg" /></a>
              <a href={REPO}><img alt="GitHub stars" src="https://img.shields.io/github/stars/Ajay-Maury/spin-wheel-game?style=flat&logo=github" /></a>
              <a href={`${REPO}/blob/main/LICENSE`}><img alt="license" src="https://img.shields.io/npm/l/spin-wheel-game.svg" /></a>
            </p>
          </div>
          <HeroWheel />
        </section>

        <section className="features" aria-label="Features">
          {features.map((feature) => (
            <div className="card feature" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </section>

        <section id="playground">
          <h2>Playground</h2>
          <p className="section-lead">Change the props and spin. The code below the wheel is what you would paste into your app.</p>
          <Playground />
        </section>

        <section id="install">
          <h2>Install and use</h2>
          <p className="section-lead">Requires React 18 or newer, which is a peer dependency.</p>
          <CodeBlock code="npm install spin-wheel-game" label="bash" />
          <CodeBlock code={usageCode} label="tsx" />
        </section>

        <section id="props">
          <h2>Props</h2>
          <p className="section-lead">All props except <code>segments</code> and <code>onFinished</code> are optional.</p>
          <div className="table-wrap card">
            <table>
              <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                {propDocs.map((prop) => (
                  <tr key={prop.name}>
                    <td data-label="Prop"><code className="name">{prop.name}</code></td>
                    <td data-label="Type"><code>{prop.type}</code></td>
                    <td data-label="Default"><code>{prop.default}</code></td>
                    <td data-label="Description">{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">
            Invalid values for <code>size</code>, <code>upDuration</code> and <code>downDuration</code> (<code>NaN</code>, negative, or zero where that makes no sense) fall back to the defaults.
            With fewer than 2 segments the component renders nothing and logs a warning.
          </p>
        </section>

        <section id="releases">
          <h2>Releases</h2>
          <p className="section-lead">What changed in each version, newest first. The same notes live in <a href={`${REPO}/blob/main/CHANGELOG.md`}>CHANGELOG.md</a>.</p>
          <Changelog />
        </section>

        <section id="support">
          <Support />
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <span>MIT licensed</span>
          <span><a href={REPO}>GitHub</a> · <a href={NPM}>npm</a> · <a href={`${REPO}/issues`}>Report an issue</a></span>
        </div>
      </footer>
    </>
  )
}

export default App
