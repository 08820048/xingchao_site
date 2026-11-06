import dawn from "@/assets/story/06-dawn.webp";
import dawnM from "@/assets/story/06-dawn-m.webp";
import called from "@/assets/story/03-called.webp";
import calledM from "@/assets/story/03-called-m.webp";
import dusk from "@/assets/story/01-dusk.webp";
import duskM from "@/assets/story/01-dusk-m.webp";
import gate from "@/assets/story/02-gate.webp";
import gateM from "@/assets/story/02-gate-m.webp";
import lighthouse from "@/assets/story/04-lighthouse.webp";
import lighthouseM from "@/assets/story/04-lighthouse-m.webp";
import listen from "@/assets/story/05-listen.webp";
import listenM from "@/assets/story/05-listen-m.webp";

export type Scene = {
  id: string;
  /** 章节标记，如「序」「一」 */
  mark: string;
  /** 章节名，如「潮门」 */
  name: string;
  src: string;
  srcM: string;
  alt: string;
  /** 画面中人物所在的横向位置（百分比），手机裁切时保证她不出框 */
  focus: string;
  /** 文字放在画面哪一侧 */
  side: "left" | "right";
  /** 文字色调：light = 浅色字（夜景），dark = 深色字（亮景） */
  tone: "light" | "dark";
  title: string;
  body: string;
  /** 与相邻章节衔接处的颜色（由图片边缘取色，保证过渡无硬线） */
  seamTop: string;
  seamBottom: string;
  /** 文字一侧的压暗/提亮罩色 */
  scrim: string;
};

/**
 * 六幕：一夜潮汐，天色从黄昏走到黎明。
 * seamTop / seamBottom 为相邻两幕边缘颜色的中点，两侧渐变汇入同一色，接缝处没有硬线。
 */
export const scenes: Scene[] = [
  {
    id: "dusk",
    mark: "序",
    name: "黄昏",
    src: dusk,
    srcM: duskM,
    alt: "黄昏的海面上漂着成百上千盏灯船，星潮坐在岸边的礁石上望着它们",
    focus: "86% 50%",
    side: "left",
    tone: "dark",
    title: "群聊有潮汐，\n她懂分寸。",
    body: "星潮只服务你放行的群，只在被叫到时开口。回复、群管、统计与 AI 问答，装进一个由你自己部署的机器人里。",
    seamTop: "#8f78a5",
    seamBottom: "#44586f",
    scrim: "rgba(255, 226, 200, 0)",
  },
  {
    id: "gate",
    mark: "一",
    name: "潮门",
    src: gate,
    srcM: gateM,
    alt: "夜里海中立着一座潮门，星潮站在石阶上，只放亮灯的船通过",
    focus: "30% 50%",
    side: "left",
    tone: "light",
    title: "默认拒绝。",
    body: "白名单为空时，星潮不处理任何一个群。你放行的群，她才开口；你停用的群，重启后依然安静。",
    seamTop: "#44586f",
    seamBottom: "#284462",
    scrim: "rgba(8, 18, 40, .5)",
  },
  {
    id: "called",
    mark: "二",
    name: "纸船",
    src: called,
    srcM: calledM,
    alt: "午夜的海面漂满像聊天气泡的纸船，星潮指尖抵唇，只有一只纸船朝她转来",
    focus: "84% 50%",
    side: "left",
    tone: "light",
    title: "被叫到才开口。",
    body: "指令、关键词、@ 与昵称，四种叫法。同一个词 8 秒内不会重复回应，群里不会被刷屏。",
    seamTop: "#284462",
    seamBottom: "#38525c",
    scrim: "rgba(6, 16, 40, .45)",
  },
  {
    id: "lighthouse",
    mark: "三",
    name: "灯塔",
    src: lighthouse,
    srcM: lighthouseM,
    alt: "深夜灯塔里的小屋，星潮在灯下写记录，架上的玻璃罐里收着珍珠",
    focus: "66% 50%",
    side: "left",
    tone: "light",
    title: "数据留在你这里。",
    body: "日志、词库、统计都存在你自己的服务器。只有你开启 AI，被唤起的那一句才会发给你配置的模型。",
    seamTop: "#38525c",
    seamBottom: "#455256",
    scrim: "rgba(10, 36, 40, 0)",
  },
  {
    id: "listen",
    mark: "四",
    name: "申诉",
    src: listen,
    srcM: listenM,
    alt: "黎明前的雨里，被拒在门外的人在小船上举着纸条解释，星潮提灯俯身倾听",
    focus: "28% 50%",
    side: "right",
    tone: "light",
    title: "也听你申诉。",
    body: "处罚有迹可查。重复违规逐级加重；被误判的人可以直接私聊申诉，管理员在面板里通过或驳回，记录一目了然。",
    seamTop: "#455256",
    seamBottom: "#799296",
    scrim: "rgba(20, 38, 52, .5)",
  },
  {
    id: "dawn",
    mark: "终",
    name: "黎明",
    src: dawn,
    srcM: dawnM,
    alt: "黎明的海边，星潮微笑着把一盏里面亮着星光的提灯递向你",
    focus: "24% 50%",
    side: "right",
    tone: "dark",
    title: "让星潮加入你的群。",
    body: "Apache-2.0 开源，自己部署，自己修改。想先看看她的样子，可以扫码进体验群。",
    seamTop: "#799296",
    seamBottom: "#f2ebdd",
    scrim: "rgba(255, 244, 224, 0)",
  },
];

export const github = "https://github.com/08820048/xingchao";
