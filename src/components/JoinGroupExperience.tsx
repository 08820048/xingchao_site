import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";

export const JOIN_GROUP_URL =
  "https://qun.qq.com/universal-share/share?ac=1&authKey=nMOs%2BytM%2BqRCrODb1IdArQABDOoLzHzPyPR3Qgk7tOa91kkK7gtWSf6evKDysGcz&busi_data=eyJncm91cENvZGUiOiI3MzMyODY2MjEiLCJ0b2tlbiI6ImRFQjVTdGpCbVV5UnRKbGJYSUcrVG5GKzNjS092R0hOVUp0QTE0bUN1dDZ1MWIwR1E3c1J0d2VNTDFZeFN0dFMiLCJ1aW4iOiIyMjE3MDIxNTYzIn0%3D&data=RKOVDUsJt7I9_5elRmatdRhqx2oPxvObObncvnJIMNNUlwkaOQPSQILIIhzh0x8yUitJXvGeU0fiyhO2gBisQQ&svctype=4&tempid=h5_group_info";

const STAGE = 460;
const FLIGHT = 620;
const STAGGER = 700;
const TOTAL = FLIGHT + STAGGER;
const REDUCED_TOTAL = 200;
const INK = "#141416";
const PAPER = "#fcfcfc";

const qr = QRCode.create(JOIN_GROUP_URL, { errorCorrectionLevel: "L" });
const matrixSize = qr.modules.size;
const cell = Math.floor(336 / matrixSize);
const codeSize = matrixSize * cell;
const codeOrigin = (STAGE - codeSize) / 2;
const launchX = STAGE / 2;
const launchY = STAGE - 8;

type Module = {
  x: number;
  y: number;
  angle: number;
  delay: number;
};

const darkModules = Array.from(qr.modules.data.entries())
  .filter(([, value]) => value === 1)
  .map(([index]) => {
    const row = Math.floor(index / matrixSize);
    const column = index % matrixSize;
    const x = codeOrigin + (column + 0.5) * cell;
    const y = codeOrigin + (row + 0.5) * cell;
    return { x, y, distance: Math.hypot(x - launchX, y - launchY) };
  });

const distances = darkModules.map(({ distance }) => distance);
const minDistance = Math.min(...distances);
const distanceRange = Math.max(...distances) - minDistance;
const modules: Module[] = darkModules.map(({ x, y, distance }) => ({
  x,
  y,
  angle: Math.atan2(y - launchY, x - launchX),
  delay: ((distance - minDistance) / distanceRange) * STAGGER,
}));

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuint(value: number) {
  return 1 - (1 - value) ** 5;
}

function drawSolidCode(context: CanvasRenderingContext2D, opacity: number) {
  context.globalAlpha = opacity;
  for (const module of modules) {
    context.fillRect(module.x - cell / 2, module.y - cell / 2, cell, cell);
  }
}

function drawFrame(context: CanvasRenderingContext2D, clock: number, reducedMotion: boolean) {
  context.globalAlpha = 1;
  context.fillStyle = PAPER;
  context.fillRect(0, 0, STAGE, STAGE);
  context.fillStyle = INK;

  if (reducedMotion) {
    const opacity = clamp(clock / REDUCED_TOTAL);
    drawSolidCode(context, opacity);
    context.globalAlpha = 1;
    return;
  }

  for (const module of modules) {
    const raw = clamp((clock - module.delay) / FLIGHT);
    if (raw === 0) continue;

    const progress = easeOutQuint(raw);
    const x = launchX + (module.x - launchX) * progress;
    const y = launchY + (module.y - launchY) * progress;
    const length = cell * (1 + (1 - progress) * 4);
    const thickness = cell * (0.18 + progress * 0.82);

    context.save();
    context.translate(x, y);
    context.rotate(module.angle * (1 - progress));
    context.globalAlpha = Math.min(1, raw * 3);
    context.fillRect(-length / 2, -thickness / 2, length, thickness);
    context.restore();
  }

  context.globalAlpha = 1;
}

export function JoinGroupExperience() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef(0);
  const targetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const drawRef = useRef<() => void>(() => undefined);
  const animateRef = useRef<(time: number) => void>(() => undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = STAGE * ratio;
    canvas.height = STAGE * ratio;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(ratio, ratio);
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    drawRef.current = () => drawFrame(context, clockRef.current, reducedMotionRef.current);

    animateRef.current = (time) => {
      const elapsed = time - lastFrameRef.current;
      const direction = Math.sign(targetRef.current - clockRef.current);
      const rate = direction < 0 ? 1.7 : 1;
      clockRef.current += elapsed * direction * rate;

      if (direction > 0) clockRef.current = Math.min(clockRef.current, targetRef.current);
      if (direction < 0) clockRef.current = Math.max(clockRef.current, targetRef.current);
      drawRef.current();

      if (clockRef.current !== targetRef.current) {
        lastFrameRef.current = time;
        frameRef.current = requestAnimationFrame(animateRef.current);
        return;
      }

      frameRef.current = null;
      if (clockRef.current === 0) dialogRef.current?.close();
    };

    // Park independently of dialog state; tying this to `open` skips the entrance.
    clockRef.current = 0;
    targetRef.current = 0;
    drawRef.current();

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const runToward = (target: number) => {
    targetRef.current = target;
    lastFrameRef.current = performance.now();
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(animateRef.current);
    }
  };

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    runToward(reducedMotionRef.current ? REDUCED_TOTAL : TOTAL);
  };

  const close = () => runToward(0);

  return (
    <>
      <Button
        size="sm"
        className="rounded-full px-3 transition-[scale,box-shadow] duration-150 ease-out active:scale-[0.96]"
        aria-haspopup="dialog"
        onClick={open}
      >
        入群体验
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="join-group-title"
        className="m-auto max-h-[calc(100dvh-1rem)] w-[min(calc(100%-1rem),36rem)] max-w-none overflow-y-auto rounded-[2rem] bg-transparent p-2 text-[#312a3c] backdrop:bg-[#241c30]/35 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="rounded-3xl bg-white px-4 pb-4 pt-5 shadow-[0_24px_90px_rgba(42,28,57,.24)] sm:px-6 sm:pb-6">
          <div className="flex items-start justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-semibold tracking-[.18em] text-[#9a6caf]">XINGCHAO GROUP</p>
              <h2 id="join-group-title" className="mt-2 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                扫码加入「星潮酱体验群」
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">二维码正在抵达。也可以直接点击下方链接唤起 QQ。</p>
            </div>
            <Button
              variant="ghost"
              size="icon-lg"
              className="size-10 rounded-full transition-transform duration-150 ease-out active:scale-[0.96]"
              aria-label="关闭入群二维码"
              onClick={close}
            >
              <X />
            </Button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-[#fcfcfc] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
            <canvas
              ref={canvasRef}
              width={STAGE}
              height={STAGE}
              role="img"
              aria-label="以光束动画出现的星潮酱体验群二维码"
              className="mx-auto block aspect-square h-auto w-full max-w-[calc(100dvh-18rem)]"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              render={<a href={JOIN_GROUP_URL} target="_blank" rel="noreferrer" />}
              className="transition-[scale,box-shadow] duration-150 ease-out active:scale-[0.96]"
            >
              点击链接加入群聊
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
