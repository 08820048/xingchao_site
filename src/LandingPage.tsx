import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { JoinGroupExperience } from "@/components/JoinGroupExperience";
import { Mark } from "@/components/Mark";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { github, scenes, type Scene } from "@/lib/story";

/* ------------------------------------------------------------------ 附录内容 */

const capabilities = [
  ["关键词与指令", "精确或包含匹配，词库热更新，每个群可独立开关。", "/reply"],
  ["AI 问答", "@ 或昵称唤起，保留多轮上下文，能查群信息、做统计、执行群管。接任意 OpenAI 兼容模型，如 GLM、DeepSeek。", "@星潮"],
  ["敏感词与分级处罚", "命中后由 AI 结合语境复核，确认违规才处理。30 天内重复违规，禁言逐次加重，直至移出群聊。", "/敏感词"],
  ["申诉", "被处罚的人直接私聊机器人说明理由，管理员在面板里通过或驳回。", "私聊"],
  ["群管", "禁言、全体禁言、踢出、撤回；加群申请由 AI 审批；新人进群欢迎。", "/禁言"],
  ["活跃统计", "发言量、参与人数、发言 Top5，与昨日对比。", "/stats"],
  ["定时提醒", "到点向指定群发消息，支持 @全体与重复规则。", "/task"],
  ["语音", "群聊用 QQ AI 语音回复，可随时换音色；收到语音也能转成文字。", "/音色"],
  ["满员清理", "群满时发提醒，并按活跃度列出待清理成员，确认后才执行。", "/清理群员"],
  ["管理面板", "在浏览器里管理词库、白名单、AI 模型与额度，查看日志与违规记录。", "/panel"],
] as const;

const envExample = `# .env —— 只需这几项
XINGCHAO_SUPERUSERS=10000        # 超管 QQ
XINGCHAO_GROUP_WHITELIST=123456  # 群白名单
ONEBOT_ACCESS_TOKEN=<16位以上随机串>
XINGCHAO_PANEL_PASSWORD=<面板密码>

# 可选：AI（OpenAI 兼容接口）
XINGCHAO_AI_BASE_URL=https://api.deepseek.com
XINGCHAO_AI_API_KEY=sk-...`;

const steps = [
  ["填写环境变量", "超管、群白名单、访问令牌。"],
  ["启动容器", "docker compose up -d，同时拉起 NoneBot2 与 NapCat。"],
  ["扫码并连接", "用 QQ 小号登录 NapCat，配置反向 WebSocket。"],
  ["验证", "白名单群里发一句 /ping，收到 pong 即完成。"],
];

const faqs = [
  { q: "星潮会回复群里的每一条消息吗？", a: "不会。她默认只响应指令、关键词、@ 和昵称；AI 问答也可以单独关闭。冷却机制会抑制重复触发。" },
  { q: "可以只让机器人服务指定群吗？", a: "可以，这是默认行为。空白名单不会处理任何群；你也可以在运行时单独停用某个群，重启后依然保留。" },
  { q: "违规处罚是怎么算的？会不会误伤？", a: "词库命中只是候选，默认再交给 AI 结合语境复核，确认违规才处理。同一个人在同一群 30 天内：第 1 次撤回，第 2 次禁言翻倍，第 3 次禁言 30 天，第 4 次起移出群聊。AI 复核不可用时的兜底撤回不计入次数，申诉通过的记录也不再计数。面板里能看到每个词的命中与放行情况，便于清理过宽的词。" },
  { q: "被误判了怎么办？", a: "被处罚的人直接私聊机器人说明理由即可，7 天内有效，不需要记指令，群临时会话也能用。管理员在面板「违规记录」里通过或驳回，通过会解除禁言。" },
  { q: "AI 功能支持哪些模型？数据会发给第三方吗？", a: "任何 OpenAI 兼容接口都行，如智谱 GLM、DeepSeek，在面板「AI」页填地址、密钥和模型即可，还能设置每群、每人的每日上限。只有你开启 AI 时，被唤起的那一句才会发给你配置的服务；日志、配置和统计始终留在本机。" },
  { q: "怎么更新到新版本？", a: "在仓库目录执行 git pull && docker compose up -d --build。词库、白名单、统计都在 SQLite 与本地文件里，更新不会丢失。每次发版后，机器人会在群里发一条更新公告，群里发 /更新日志 也能随时查看。" },
  { q: "使用 NapCat 登录 QQ 安全吗？", a: "NapCat 使用非官方协议，存在账号风控与封禁风险。请使用小号，不要与电脑 QQ 同时登录，也不要把管理端口暴露到公网。星潮与腾讯官方开放平台无关。" },
];

/* ------------------------------------------------------------------ 滚动：视差 + 当前幕 */

function useStoryScroll(
  sceneRefs: React.MutableRefObject<(HTMLElement | null)[]>,
  appendixRef: React.RefObject<HTMLElement | null>,
  onActive: (index: number) => void,
) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastActive = -2;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let active = -1;
      sceneRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh * 0.2 || rect.top > vh * 1.2) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // 屏幕中心为 0
        if (!reduced) {
          el.style.setProperty("--p", String(Math.round(progress * -26)));
          el.style.setProperty("--s", "1.075");
        }
        if (rect.top <= vh * 0.5 && rect.bottom > vh * 0.5) active = i;
      });
      const paper = appendixRef.current ? appendixRef.current.getBoundingClientRect().top < vh * 0.35 : false;
      const index = paper ? scenes.length : active;
      if (index !== lastActive) {
        lastActive = index;
        const root = document.documentElement;
        root.dataset.paper = String(index === scenes.length);
        if (index >= 0 && index < scenes.length) root.dataset.tone = scenes[index].tone;
        onActive(index);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sceneRefs, appendixRef, onActive]);
}

/* ------------------------------------------------------------------ 组件 */

const REPLIES = ["我在。", "在的，要我做什么？", "你叫我了。"];

/** 第二幕的互动：只有叫她的名字，她才开口。 */
function CallHer({ onCall }: { onCall: () => void }) {
  const [value, setValue] = useState("");
  const [hint, setHint] = useState("");

  const check = (text: string, submitted: boolean) => {
    if (/星潮|xingchao/i.test(text)) {
      onCall();
      setHint("只有被叫到，她才开口。");
      return;
    }
    if (submitted && text.trim()) setHint("她没有回应。叫她的名字才行。");
  };

  return (
    <form
      className="call"
      onSubmit={(e) => {
        e.preventDefault();
        check(value, true);
      }}
    >
      <label htmlFor="call">试一试</label>
      <input
        id="call"
        value={value}
        autoComplete="off"
        placeholder="在这里说一句话……"
        onChange={(e) => {
          setValue(e.target.value);
          if (/星潮|xingchao/i.test(e.target.value)) check(e.target.value, false);
          else setHint("");
        }}
      />
      <p className="hint" aria-live="polite">{hint}</p>
    </form>
  );
}

function SceneView({
  scene,
  index,
  setRef,
  children,
  pins,
}: {
  scene: Scene;
  index: number;
  setRef: (el: HTMLElement | null) => void;
  children?: React.ReactNode;
  pins?: React.ReactNode;
}) {
  const hero = index === 0;
  const px = parseFloat(scene.focus) / 100;
  const style = {
    "--px": px,
    "--seam-top": scene.seamTop,
    "--seam-bottom": scene.seamBottom,
    "--scrim": scene.scrim,
  } as CSSProperties;

  return (
    <section
      id={scene.id}
      ref={setRef}
      className="scene"
      data-id={scene.id}
      data-side={scene.side}
      data-tone={scene.tone}
      style={style}
      aria-label={`${scene.mark}·${scene.name}`}
    >
      <div className="frame">
        <picture>
          <source media="(max-width: 860px)" srcSet={scene.srcM} />
          <img
            src={scene.src}
            alt={scene.alt}
            width={1672}
            height={941}
            loading={hero ? "eager" : "lazy"}
            fetchPriority={hero ? "high" : "auto"}
            decoding="async"
          />
        </picture>
        {pins}
      </div>
      {!hero && <div className="fade-top" />}
      <div className="fade-bottom" />
      <div className="scrim" />

      <Reveal className="copy">
        {hero ? (
          <>
            <p className="chapter">{scene.mark} · {scene.name}</p>
            <h1 className="h-title">{scene.title}</h1>
            <p className="body">{scene.body}</p>
            <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <a
                href={`${github}#快速开始`}
                target="_blank"
                rel="noreferrer"
                className="cta-solid"
              >
                开始部署 →
              </a>
              <a href={github} target="_blank" rel="noreferrer" className="link-sweep inline-flex items-center gap-1 text-[15px]">
                查看源码 <ArrowUpRight className="size-4" />
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="v-title">{scene.title}</h2>
            <div className="stack">
              <p className="chapter">{scene.mark} · {scene.name}</p>
              <p className="body">{scene.body}</p>
              {children}
              {index === scenes.length - 1 ? (
                <div style={{ marginTop: 32, display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href={`${github}#快速开始`}
                    target="_blank"
                    rel="noreferrer"
                    className="cta-solid"
                  >
                    开始部署 →
                  </a>
                  <a href={github} target="_blank" rel="noreferrer" className="link-sweep inline-flex items-center gap-1 text-[15px]">
                    GitHub <ArrowUpRight className="size-4" />
                  </a>
                </div>
              ) : null}
            </div>
          </>
        )}
      </Reveal>

      {hero && (
        <div className="scroll-cue" aria-hidden="true">
          <i />
          向下翻页
        </div>
      )}
    </section>
  );
}

function Chrome({ active }: { active: number }) {
  return (
    <>
      <header className="story-chrome fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-10">
          <a href="#dusk" aria-label="回到开头" className="group flex items-center gap-2.5">
            <Mark className="size-6 transition-transform duration-500 group-hover:rotate-[18deg]" />
            <span className="font-serif text-lg font-extrabold tracking-tight">星潮</span>
          </a>
          <JoinGroupExperience />
        </div>
      </header>
      <nav className="chapter-nav story-chrome" aria-label="章节">
        {scenes.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} aria-current={active === i} aria-label={`${s.mark} ${s.name}`}>
            {s.mark}
          </a>
        ))}
        <a href="#appendix" aria-current={active === scenes.length} aria-label="附录">附</a>
      </nav>
    </>
  );
}

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  };
  return (
    <div className="overflow-hidden rounded-md bg-leaf text-paper">
      <div className="flex items-center justify-between border-b border-paper/15 px-5 py-3">
        <span className="font-mono text-xs text-paper/60">.env</span>
        <button
          type="button"
          onClick={copy}
          aria-label="复制环境变量示例"
          className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs text-paper/70 transition-colors hover:text-paper active:scale-[0.96]"
        >
          {copied ? <Check className="size-3.5 text-tide" /> : <Copy className="size-3.5" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-paper/90">
        <code>{envExample}</code>
      </pre>
    </div>
  );
}

function Appendix({ setRef }: { setRef: (el: HTMLElement | null) => void }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <section id="appendix" ref={setRef} className="appendix">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="shell pb-10 pt-28 lg:pt-40">
        <Reveal>
          <p className="a-label">附录</p>
          <h2 className="a-title mt-6 text-[clamp(2.4rem,6vw,5rem)]">给要动手的人。</h2>
          <p className="a-body mt-6 max-w-xl text-base">故事讲完了。下面是她能做的事、怎么把她请到你的群里，以及你可能想先知道的。</p>
        </Reveal>

        <div className="mt-24">
          <Reveal><p className="a-label mb-8">能力 · 目录</p></Reveal>
          <div className="cap-grid">
            {capabilities.map(([name, text, cmd]) => (
              <Reveal key={name} className="cap">
                <h3>{name}</h3>
                <code>{cmd}</code>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-32 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="min-w-0">
            <Reveal>
              <p className="a-label">部署</p>
              <h2 className="a-title mt-6 text-[clamp(2rem,4vw,3.2rem)]">四步，一台 1 核 1G 的服务器。</h2>
              <p className="mt-6 font-mono text-sm text-leaf/70">QQ 群 → NapCat → 星潮 Bot → SQLite</p>
            </Reveal>
            <ol className="mt-10 border-l border-leaf/25">
              {steps.map(([title, text], i) => (
                <Reveal as="li" key={title} delay={i * 80} className="relative pb-8 pl-8 last:pb-0">
                  <span className="absolute -left-[5px] top-[10px] size-[9px] rounded-full bg-paper ring-1 ring-lantern" aria-hidden="true" />
                  <h3 className="font-serif text-lg font-extrabold">{title}</h3>
                  <p className="a-body mt-1 text-[15px]">{text}</p>
                </Reveal>
              ))}
            </ol>
            <a href={`${github}/blob/main/docs/DEPLOYMENT.md`} target="_blank" rel="noreferrer" className="link-sweep mt-10 inline-flex items-center gap-1.5 text-[15px]">
              完整部署文档 <ArrowUpRight className="size-4" />
            </a>
          </div>
          <Reveal className="min-w-0 self-start">
            <CopyBlock code={envExample} />
          </Reveal>
        </div>

        <div className="mt-32">
          <Reveal>
            <p className="a-label">问答</p>
            <h2 className="a-title mt-6 text-[clamp(2rem,4vw,3.2rem)]">你可能想先知道的。</h2>
          </Reveal>
          <div className="mt-12 max-w-3xl border-t border-leaf">
            <Accordion>
              {faqs.map(({ q, a }) => (
                <AccordionItem key={q} value={q} className="border-leaf/20">
                  <AccordionTrigger className="py-6 font-serif text-lg font-extrabold tracking-tight hover:text-lantern">{q}</AccordionTrigger>
                  <AccordionPanel className="max-w-2xl text-[15px] leading-8 text-leaf/75">{a}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <footer className="border-t border-leaf/20 py-10">
        <div className="shell flex flex-col gap-5 text-xs text-leaf/65 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md leading-6">基于 NapCat、OneBot v11 与 NoneBot2 构建，与腾讯官方开放平台无关。</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a className="link-sweep hover:text-leaf" href={github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="link-sweep hover:text-leaf" href={`${github}/blob/main/LICENSE`} target="_blank" rel="noreferrer">Apache-2.0</a>
            <a className="link-sweep hover:text-leaf" href="/updates">更新</a>
            <span>© 2026 Xingchao · <a className="link-sweep hover:text-leaf" href="https://xuyi.dev" target="_blank" rel="noreferrer">xuyi</a></span>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default function LandingPage() {
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const appendixRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [called, setCalled] = useState(0);
  const [reply, setReply] = useState(REPLIES[0]);

  useStoryScroll(sceneRefs, appendixRef, setActive);

  const onCall = () => {
    setReply(REPLIES[Math.floor(Math.random() * REPLIES.length)]);
    setCalled((n) => n + 1);
  };

  return (
    <div className="story">
      <Chrome active={active} />
      <main>
        {scenes.map((scene, i) => (
          <SceneView
            key={scene.id}
            scene={scene}
            index={i}
            setRef={(el) => {
              sceneRefs.current[i] = el;
            }}
            pins={
              scene.id === "called" ? (
                <>
                  <div className="pin star-glow" key={`g${called}`} data-on={called > 0} />
                  <div className="pin bubble" data-on={called > 0} aria-live="polite">{reply}</div>
                </>
              ) : null
            }
          >
            {scene.id === "called" ? <CallHer onCall={onCall} /> : null}
          </SceneView>
        ))}
        <Appendix setRef={(el) => { appendixRef.current = el; }} />
      </main>
    </div>
  );
}
