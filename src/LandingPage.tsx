import { ArrowRight, ArrowUpRight, Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

import avatar from "@/assets/brand/avatar.webp";
import { JoinGroupExperience } from "@/components/JoinGroupExperience";
import { Mark } from "@/components/Mark";
import { Reveal } from "@/components/Reveal";
import { TideCanvas } from "@/components/TideCanvas";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";

const github = "https://github.com/08820048/xingchao";

/* ------------------------------------------------------------------ 内容 */

const principles = [
  {
    title: "默认拒绝。",
    text: "白名单为空时，星潮不处理任何一个群。你放行的群，她才开口；你停用的群，重启后依然安静。",
  },
  {
    title: "被叫到才开口。",
    text: "指令、关键词、@ 与昵称，四种叫法。同一个词 8 秒内不会重复回应，群里不会被刷屏。",
  },
  {
    title: "数据留在你这里。",
    text: "日志、词库、统计都存在你自己的服务器。只有你开启 AI，被唤起的那一句才会发给你配置的模型。",
  },
];

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

type Line =
  | { who: "user"; name: string; time: string; text: string }
  | { who: "bot"; text: string; note?: string }
  | { who: "recalled"; name: string; time: string };

const transcript: Line[] = [
  { who: "user", name: "阿澈", time: "21:02", text: "/stats" },
  { who: "bot", text: "本群今日 1,284 条消息，42 人参与。发言最多：阿澈、小鹿、老周。" },
  { who: "recalled", name: "路人甲", time: "21:07" },
  {
    who: "bot",
    text: "@路人甲 你因发送了敏感违禁词，消息已被撤回。",
    note: "30 天内第 2 次违规 · 禁言 20 分钟",
  },
  { who: "user", name: "小鹿", time: "21:15", text: "@星潮 今天 GitHub 趋势榜有什么？" },
  { who: "bot", text: "前三是 …（来自 /trending）。要我念给你听吗？" },
  { who: "bot", text: "本群成员已满（500/500）。管理员将按活跃度清理长期不发言的成员。" },
];

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
  {
    q: "星潮会回复群里的每一条消息吗？",
    a: "不会。她默认只响应指令、关键词、@ 和昵称；AI 问答也可以单独关闭。冷却机制会抑制重复触发。",
  },
  {
    q: "可以只让机器人服务指定群吗？",
    a: "可以，这是默认行为。空白名单不会处理任何群；你也可以在运行时单独停用某个群，重启后依然保留。",
  },
  {
    q: "违规处罚是怎么算的？会不会误伤？",
    a: "词库命中只是候选，默认再交给 AI 结合语境复核，确认违规才处理。同一个人在同一群 30 天内：第 1 次撤回，第 2 次禁言翻倍，第 3 次禁言 30 天，第 4 次起移出群聊。AI 复核不可用时的兜底撤回不计入次数，申诉通过的记录也不再计数。面板里能看到每个词的命中与放行情况，便于清理过宽的词。",
  },
  {
    q: "被误判了怎么办？",
    a: "被处罚的人直接私聊机器人说明理由即可，7 天内有效，不需要记指令，群临时会话也能用。管理员在面板「违规记录」里通过或驳回，通过会解除禁言。",
  },
  {
    q: "AI 功能支持哪些模型？数据会发给第三方吗？",
    a: "任何 OpenAI 兼容接口都行，如智谱 GLM、DeepSeek，在面板「AI」页填地址、密钥和模型即可，还能设置每群、每人的每日上限。只有你开启 AI 时，被唤起的那一句才会发给你配置的服务；日志、配置和统计始终留在本机。",
  },
  {
    q: "怎么更新到新版本？",
    a: "在仓库目录执行 git pull && docker compose up -d --build。词库、白名单、统计都在 SQLite 与本地文件里，更新不会丢失。每次发版后，机器人会在群里发一条更新公告，群里发 /更新日志 也能随时查看。",
  },
  {
    q: "使用 NapCat 登录 QQ 安全吗？",
    a: "NapCat 使用非官方协议，存在账号风控与封禁风险。请使用小号，不要与电脑 QQ 同时登录，也不要把管理端口暴露到公网。星潮与腾讯官方开放平台无关。",
  },
];

/* ------------------------------------------------------------------ 组件 */

function SectionHead({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-12">
      <p className="label pt-3">{label}</p>
      <h2 className="section-title max-w-3xl text-[clamp(2rem,4.4vw,3.5rem)]">{children}</h2>
    </div>
  );
}

function Nav() {
  const links = [
    ["能力", "#capabilities"],
    ["对话", "#talk"],
    ["部署", "#deploy"],
    ["问答", "#faq"],
    ["更新", "/updates"],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-10">
        <a href="/" aria-label="星潮首页" className="group flex items-center gap-2.5 text-pearl">
          <Mark className="size-6 text-tide transition-transform duration-500 group-hover:rotate-[18deg]" />
          <span className="font-serif text-lg font-semibold tracking-tight">星潮</span>
        </a>
        <nav aria-label="主导航" className="hidden items-center gap-8 md:flex">
          {links.map(([name, href]) => (
            <a key={name} href={href} className="link-sweep text-sm text-mist transition-colors hover:text-pearl">
              {name}
            </a>
          ))}
        </nav>
        <JoinGroupExperience />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/70 to-transparent" />
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden sm:min-h-[100svh]">
      <TideCanvas
        variant="hero"
        className="absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_bottom,transparent,#000_26%,#000_92%,transparent)]"
      />
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-24 pt-36 sm:px-10 sm:pb-28">
        <p className="label mb-8 sm:mb-10">Xingchao · 开源 · 自托管 · Apache-2.0</p>
        <h1 className="display text-[clamp(3.2rem,9.4vw,8.6rem)]">
          群聊有潮汐，
          <br />
          她懂分寸。
        </h1>
        <p className="prose-quiet mt-8 max-w-2xl text-base sm:text-lg">
          星潮只服务你放行的群，只在被叫到时开口。回复、群管、统计与 AI 问答，装进一个由你自己部署的机器人里。
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={`${github}#快速开始`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-pearl px-6 text-[15px] font-medium text-ink transition-[transform,background-color] duration-200 hover:bg-white active:scale-[0.97]"
          >
            开始部署
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            className="link-sweep inline-flex items-center gap-1.5 text-[15px] text-pearl"
          >
            查看源码 <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Principles() {
  return (
    <section className="border-t border-line py-28 lg:py-40">
      <div className="shell">
        <SectionHead label="分寸">她知道什么时候不说话。</SectionHead>
        <div className="mt-16 divide-y divide-line border-y border-line lg:ml-[calc(14rem+3rem)]">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="grid gap-4 py-10 md:grid-cols-[1.1fr_1fr] md:items-baseline md:gap-10">
              <h3 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-semibold tracking-tight">{p.title}</h3>
              <p className="prose-quiet text-[15px]">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-16 border-t border-line py-28 lg:py-40">
      <div className="shell">
        <SectionHead label="能力">群里要做的事，都在这张目录里。</SectionHead>
        <p className="mt-4 font-mono text-xs text-mist lg:ml-[calc(14rem+3rem)]">15 个插件 · 20+ 指令 · 每个模块、每个群都可以独立开关</p>
        <ul className="mt-16 border-t border-line lg:ml-[calc(14rem+3rem)]">
          {capabilities.map(([name, text, cmd]) => (
            <li key={name} className="index-row grid gap-x-8 gap-y-2 border-b border-line py-6 pl-0 md:grid-cols-[12rem_1fr_auto] md:items-baseline md:py-7">
              <h3 className="index-name font-serif text-xl font-semibold tracking-tight">{name}</h3>
              <p className="text-[15px] leading-7 text-mist">{text}</p>
              <code className="text-xs text-tide md:text-right">{cmd}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Message({ line, index }: { line: Line; index: number }) {
  if (line.who === "user") {
    return (
      <Reveal delay={index * 40} className="flex flex-col items-end gap-1.5">
        <span className="font-mono text-[11px] text-mist">
          {line.name} · {line.time}
        </span>
        <p className="max-w-[88%] rounded-2xl rounded-tr-md bg-ink-3 px-4 py-2.5 text-[15px] leading-7">{line.text}</p>
      </Reveal>
    );
  }
  if (line.who === "recalled") {
    return (
      <Reveal delay={index * 40} className="flex flex-col items-end gap-1.5">
        <span className="font-mono text-[11px] text-mist">
          {line.name} · {line.time}
        </span>
        <p className="text-sm italic text-mist/70">此消息已撤回</p>
      </Reveal>
    );
  }
  return (
    <Reveal delay={index * 40} className="flex items-start gap-3">
      <img src={avatar} alt="" width={28} height={28} className="mt-1 size-7 shrink-0 rounded-full object-cover" />
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] text-tide">星潮</span>
        <p className="max-w-[88%] rounded-2xl rounded-tl-md border border-line px-4 py-2.5 text-[15px] leading-7">
          {line.text}
          {"note" in line && line.note ? (
            <span className="mt-1 block font-mono text-xs text-mist">{line.note}</span>
          ) : null}
        </p>
      </div>
    </Reveal>
  );
}

function Talk() {
  return (
    <section id="talk" className="scroll-mt-16 border-t border-line py-28 lg:py-40">
      <div className="shell grid gap-10 lg:grid-cols-[14rem_1fr_1.1fr] lg:gap-12">
        <p className="label pt-3">对话</p>
        <div className="min-w-0 max-w-md">
          <h2 className="section-title text-[clamp(2rem,3.5vw,2.9rem)]">
            像聊天一样使用，
            <br />
            也受规矩约束。
          </h2>
          <p className="prose-quiet mt-6 text-[15px]">
            以 <code className="text-pearl">/</code> 开头是指令，@ 或叫她的名字就是闲聊。超管指令只有授权账号能用，处罚有迹可查，也有申诉的出口。
          </p>
          <p className="mt-10 font-mono text-xs text-mist">示意对话，数据为虚构。</p>
        </div>
        <div className="min-w-0 rounded-3xl border border-line bg-ink-2/60 p-5 sm:p-7" role="log" aria-label="群聊示意对话">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <span className="text-sm font-medium">星潮体验群</span>
            <span className="font-mono text-[11px] text-mist">示意</span>
          </div>
          <div className="flex flex-col gap-5">
            {transcript.map((line, i) => (
              <Message key={i} line={line} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
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
      /* 剪贴板不可用时静默，用户仍可手动选择 */
    }
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-2">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-xs text-mist">.env</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-mist transition-colors hover:text-pearl active:scale-[0.96]"
          aria-label="复制环境变量示例"
        >
          {copied ? <Check className="size-3.5 text-tide" /> : <Copy className="size-3.5" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-pearl/90">
        <code>{envExample}</code>
      </pre>
    </div>
  );
}

function Deploy() {
  return (
    <section id="deploy" className="scroll-mt-16 border-t border-line py-28 lg:py-40">
      <div className="shell">
        <SectionHead label="部署">四步，一台 1 核 1G 的服务器。</SectionHead>
        <div className="mt-16 grid gap-12 lg:ml-[calc(14rem+3rem)] lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="min-w-0">
            <p className="font-mono text-sm leading-8 text-mist">
              <span className="text-pearl">QQ 群</span> → NapCat → <span className="text-pearl">星潮 Bot</span> → SQLite
            </p>
            <ol className="mt-10 border-l border-line">
              {steps.map(([title, text], i) => (
                <li key={title} className="relative pb-9 pl-8 last:pb-0">
                  <span className="absolute -left-[5px] top-[9px] size-[9px] rounded-full bg-ink ring-1 ring-tide" aria-hidden="true" />
                  <p className="font-mono text-[11px] text-mist">STEP {i + 1}</p>
                  <h3 className="mt-1 font-serif text-lg font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-mist">{text}</p>
                </li>
              ))}
            </ol>
            <a
              href={`${github}/blob/main/docs/DEPLOYMENT.md`}
              target="_blank"
              rel="noreferrer"
              className="link-sweep mt-10 inline-flex items-center gap-1.5 text-[15px]"
            >
              完整部署文档 <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="min-w-0 self-start">
            <CopyBlock code={envExample} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-line py-28 lg:py-40">
      <div className="shell">
        <SectionHead label="问答">你可能想先知道的。</SectionHead>
        <div className="mt-16 lg:ml-[calc(14rem+3rem)]">
          <Accordion>
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} value={q} className="border-line">
                <AccordionTrigger className="py-6 font-serif text-lg font-semibold tracking-tight hover:text-tide">
                  {q}
                </AccordionTrigger>
                <AccordionPanel className="max-w-2xl text-[15px] leading-8 text-mist">{a}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line py-32 lg:py-44">
      <TideCanvas
        variant="footer"
        className="absolute inset-x-0 bottom-0 -z-10 h-[70%] w-full [mask-image:linear-gradient(to_bottom,transparent,#000_60%)]"
      />
      <div className="shell">
        <h2 className="display text-[clamp(2.6rem,7vw,6rem)]">让星潮加入你的群。</h2>
        <p className="prose-quiet mt-6 max-w-lg text-base">Apache-2.0 开源，自己部署，自己修改。想先看看她的样子，可以扫码进体验群。</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={`${github}#快速开始`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-pearl px-6 text-[15px] font-medium text-ink transition-[transform,background-color] duration-200 hover:bg-white active:scale-[0.97]"
          >
            开始部署
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a href={github} target="_blank" rel="noreferrer" className="link-sweep inline-flex items-center gap-1.5 text-[15px]">
            GitHub <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="shell flex flex-col gap-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={avatar} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
          <p className="max-w-md leading-6">
            基于 NapCat、OneBot v11 与 NoneBot2 构建，与腾讯官方开放平台无关。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a className="link-sweep hover:text-pearl" href={github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="link-sweep hover:text-pearl" href={`${github}/blob/main/LICENSE`} target="_blank" rel="noreferrer">Apache-2.0</a>
          <a className="link-sweep hover:text-pearl" href="/updates">更新</a>
          <span>© 2026 Xingchao · <a className="link-sweep hover:text-pearl" href="https://xuyi.dev" target="_blank" rel="noreferrer">xuyi</a></span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div className="min-h-screen bg-ink text-pearl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav />
      <main>
        <Hero />
        <Principles />
        <Capabilities />
        <Talk />
        <Deploy />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
