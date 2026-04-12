"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Battery,
  Check,
  ChevronRight,
  Headphones,
  Loader2,
  Menu,
  Minus,
  Monitor,
  MoreHorizontal,
  Plus,
  SendHorizontal,
  Smartphone,
  Sparkles,
  SquarePen,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandingDesktopFrame, BrandingMobileFrame } from "@/components/settings/branding/BrandingPreviewFrames";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type {
  PreviewJourney,
  PreviewJourneyCard,
  PreviewJourneyProduct,
  PreviewScenario,
} from "@/lib/ai-storefront/types";

type Phase = "idle" | "pick" | "pay" | "paying" | "done";

function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function discountPct(list: number, price: number): number {
  if (list <= price) return 0;
  return Math.round(((list - price) / list) * 100);
}

function ProductThumb({ product, index }: { product: PreviewJourneyProduct; index: number }) {
  if (product.imageSrc) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
        <Image
          src={product.imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 380px) 70vw, 220px"
        />
      </div>
    );
  }
  const Icon = Headphones;
  const tones = ["bg-primary-light", "bg-muted", "bg-primary-light/70"] as const;
  return (
    <div
      className={cn(
        "flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-border/60",
        tones[index % 3]
      )}
    >
      <Icon className="h-10 w-10 text-primary/80" aria-hidden />
    </div>
  );
}

function CarouselCard({
  product,
  index,
  quantity,
  onQuantityChange,
  disabled,
}: {
  product: PreviewJourneyProduct;
  index: number;
  quantity: number;
  onQuantityChange: (next: number) => void;
  disabled: boolean;
}) {
  const list = product.listPriceInPaise;
  const pct = list ? discountPct(list, product.priceInPaise) : 0;
  return (
    <div
      className={cn(
        "w-[min(220px,78vw)] shrink-0 snap-start rounded-2xl border border-border bg-card p-3 text-left shadow-sm",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <ProductThumb product={product} index={index} />
      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="text-emerald-600 dark:text-emerald-400">★</span>
        <span className="font-medium text-foreground">{product.ratingLabel}</span>
      </div>
      <p className="mt-1 text-sm font-semibold leading-tight text-foreground">{product.name}</p>
      {product.specLines?.map((line) => (
        <p key={line} className="text-[11px] leading-snug text-muted-foreground">
          {line}
        </p>
      ))}
      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{product.description}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {formatInr(product.priceInPaise)}
        </span>
        {list && list > product.priceInPaise ? (
          <>
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              {formatInr(list)}
            </span>
            {pct > 0 ? (
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                {pct}% off
              </span>
            ) : null}
          </>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-3 flex h-9 items-stretch overflow-hidden rounded-lg border border-border bg-muted/30",
          !disabled && "dark:bg-zinc-900/40"
        )}
      >
        <button
          type="button"
          disabled={disabled || quantity <= 0}
          onClick={() => onQuantityChange(quantity - 1)}
          className={cn(
            "flex w-9 shrink-0 items-center justify-center text-foreground transition-colors",
            "hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-35",
            "focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          )}
          aria-label={`Decrease ${product.name} quantity`}
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
        <span className="flex min-w-0 flex-1 items-center justify-center border-x border-border text-sm font-semibold tabular-nums text-foreground">
          {quantity}
        </span>
        <button
          type="button"
          disabled={disabled || quantity >= 99}
          onClick={() => onQuantityChange(quantity + 1)}
          className={cn(
            "flex w-9 shrink-0 items-center justify-center text-foreground transition-colors",
            "hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-35",
            "focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          )}
          aria-label={`Increase ${product.name} quantity`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function CardRow({
  card,
  onPick,
  disabled,
  paying,
}: {
  card: PreviewJourneyCard;
  onPick: () => void;
  disabled: boolean;
  paying: boolean;
}) {
  const isMc = card.brandLabel.toLowerCase().includes("master");
  return (
    <button
      type="button"
      disabled={disabled || paying}
      onClick={onPick}
      aria-label={`Pay with ${card.brandLabel} ${card.maskedPan}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left shadow-sm transition-colors",
        !disabled && !paying && "hover:bg-muted/40",
        (disabled || paying) && "opacity-50"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand marks from /public */}
      <img
        src={isMc ? "/mastercard.png" : "/visa.png"}
        alt=""
        className="h-9 w-11 shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{card.brandLabel}</p>
        <p className="text-xs tabular-nums text-muted-foreground">{card.maskedPan}</p>
        <p className="text-[11px] text-muted-foreground">{card.expiryLabel}</p>
      </div>
      <div
        className={cn(
          "size-5 shrink-0 rounded-full border-2 border-border",
          "flex items-center justify-center"
        )}
        aria-hidden
      />
    </button>
  );
}

function BrandedLoader({
  reduceMotion,
  /** Cover the entire chat surface (header + thread + composer) inside the device frame. */
  fullDevice = false,
}: {
  reduceMotion: boolean;
  fullDevice?: boolean;
}) {
  if (fullDevice) {
    return (
      <div
        className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-zinc-950"
        role="status"
        aria-live="polite"
        aria-label="Processing payment"
      >
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="mx-auto flex w-16 justify-center">
            <Image
              src="/payglocal-logo.png"
              alt=""
              width={64}
              height={64}
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight text-primary">PayGlocal</p>
          <p className="mt-1 text-sm text-muted-foreground">Secure checkout</p>
          <div className="mt-8 flex justify-center">
            <Loader2
              className={cn("h-10 w-10 text-primary", !reduceMotion && "animate-spin")}
              aria-hidden
            />
          </div>
          <p className="mt-6 text-center text-base leading-relaxed text-muted-foreground">
            Confirming with your bank…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label="Processing payment"
    >
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-center shadow-2xl">
        <div className="mx-auto flex w-12 justify-center">
          <Image src="/payglocal-logo.png" alt="" width={48} height={48} className="h-12 w-auto object-contain" />
        </div>
        <p className="mt-2 text-sm font-semibold tracking-tight text-primary">PayGlocal</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Secure checkout</p>
        <div className="mt-4 flex justify-center">
          <Loader2
            className={cn("h-8 w-8 text-primary", !reduceMotion && "animate-spin")}
            aria-hidden
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Confirming with your bank…</p>
      </div>
    </div>
  );
}

/** iOS-style status + app bar — ChatGPT-like density; decorative only. */
function MobileChatGptChrome() {
  return (
    <div className="shrink-0 bg-white">
      <div
        className="flex h-7 items-center justify-between px-4 pt-1 text-[13px] font-semibold tabular-nums tracking-tight text-foreground"
        aria-hidden
      >
        <span>9:41</span>
        <div className="flex items-center gap-1 text-foreground">
          <Wifi className="h-3.5 w-3.5 opacity-90" strokeWidth={2.25} />
          <Battery className="h-3.5 w-3.5 opacity-90" strokeWidth={2.25} />
        </div>
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 pt-0.5">
        <button
          type="button"
          className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-black/[0.04]"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 pr-2">
          <Image src="/payglocal-logo.png" alt="" width={18} height={18} className="size-[18px] shrink-0 object-contain" />
          <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">Storefront</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" aria-hidden />
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-black/[0.04]"
          aria-label="New chat"
        >
          <SquarePen className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-black/[0.04]"
          aria-label="More"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ChatChromeRow({ compact }: { compact?: boolean }) {
  if (compact) {
    return <MobileChatGptChrome />;
  }
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2">
      <Image src="/payglocal-logo.png" alt="" width={22} height={22} className="size-[22px] shrink-0 object-contain" />
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      <span className="truncate text-xs font-semibold tracking-tight text-foreground">AI Storefront</span>
    </div>
  );
}

function DesktopChatChrome() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-2">
      <button
        type="button"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted/60"
        aria-label="Menu"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
        <Image src="/payglocal-logo.png" alt="" width={18} height={18} className="size-[18px] shrink-0 object-contain" />
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">Assistant</span>
        <span className="text-muted-foreground">▾</span>
      </div>
      <button
        type="button"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted/60"
        aria-label="New chat"
      >
        <SquarePen className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted/60"
        aria-label="More"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

function UserBubble({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={cn("flex justify-end", narrow ? "pl-2" : "pl-12")}>
      <div
        className={cn(
          "max-w-[min(92%,320px)] text-[15px] leading-relaxed text-foreground",
          narrow
            ? "rounded-[1.35rem] bg-[#ececec] px-3.5 py-2.5 shadow-none"
            : "max-w-[88%] rounded-2xl border border-border bg-muted/50 px-3 py-2.5"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AssistantBlock({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={cn("flex justify-start", narrow ? "pr-1" : "pr-8")}>
      <div className="w-full max-w-full text-[15px] leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function ChatColumn({
  journey,
  phase,
  sentUserMessage,
  cartQtyByProductId,
  setProductQuantity,
  visibleCardCount,
  selectedCardId,
  onContinue,
  onCardPick,
  successBody,
  successTitle,
  reduceMotion,
  composeText,
  setComposeText,
  onSend,
  compact,
  desktopChrome,
}: {
  journey: PreviewJourney;
  phase: Phase;
  sentUserMessage: string | null;
  cartQtyByProductId: Record<string, number>;
  setProductQuantity: (productId: string, next: number) => void;
  visibleCardCount: number;
  selectedCardId: string | null;
  onContinue: () => void;
  onCardPick: (id: string) => void;
  successBody: string;
  successTitle: string;
  reduceMotion: boolean;
  composeText: string;
  setComposeText: (s: string) => void;
  onSend: () => void;
  compact?: boolean;
  desktopChrome?: boolean;
}) {
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const showThread = phase !== "idle";
  const showPayFlow = phase === "pay" || phase === "paying" || phase === "done";
  const carouselLocked = phase !== "pick";
  const composerDisabled = phase !== "idle";

  /** Single primitive dep so the effect’s dependency array length never changes (React 19 / Fast Refresh). */
  const threadScrollKey = useMemo(
    () =>
      [
        phase,
        sentUserMessage ?? "",
        visibleCardCount,
        selectedCardId ?? "",
        successBody,
        reduceMotion ? "1" : "0",
        journey.products.length,
      ].join("\u001e"),
    [
      phase,
      sentUserMessage,
      visibleCardCount,
      selectedCardId,
      successBody,
      reduceMotion,
      journey.products.length,
    ]
  );

  useLayoutEffect(() => {
    const sc = threadScrollRef.current;
    if (!sc) return;
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        sc.scrollTo({
          top: sc.scrollHeight,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [threadScrollKey]);

  const thread = (
    <div className="relative min-h-[min(280px,40vh)] space-y-3">
      {phase === "idle" ? (
        <div className="flex justify-center px-3 py-8">
          <p
            className={cn(
              "max-w-[280px] text-center text-[15px] leading-relaxed",
              compact ? "text-[#6e6e6e]" : "text-muted-foreground"
            )}
          >
            {journey.idleHint ??
              "Type a question and tap Send to see product cards from your storefront."}
          </p>
        </div>
      ) : null}

      {showThread && sentUserMessage ? <UserBubble narrow={compact}>{sentUserMessage}</UserBubble> : null}

      {showThread ? (
        <AssistantBlock narrow={compact}>
          <p className="text-[15px] leading-relaxed text-foreground">{journey.assistantProductReply}</p>
          {compact ? (
            <div className="mb-1.5 mt-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-xs font-medium text-[#6e6e6e]">PayGlocal storefront</span>
            </div>
          ) : null}
          <div
            className={cn(
              "mt-3 space-y-2 bg-card p-3 shadow-sm",
              compact ? "rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "rounded-2xl border border-border"
            )}
          >
            <div className="flex justify-center sm:justify-start">
              <div
                className={cn(
                  "inline-flex max-w-full items-center justify-center rounded-full border px-3.5 py-2",
                  "border-primary/20 bg-gradient-to-b from-primary/[0.09] to-primary/[0.04]",
                  "shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.65)]",
                  "dark:border-primary/25 dark:from-primary/15 dark:to-primary/[0.07] dark:shadow-none"
                )}
              >
                <p className="text-center text-[11px] font-semibold leading-tight tracking-tight text-primary">
                  {journey.trustedMerchantBadge}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "snap-x snap-mandatory"
              )}
            >
              {journey.products.map((p, i) => (
                <CarouselCard
                  key={p.id}
                  product={p}
                  index={i}
                  quantity={cartQtyByProductId[p.id] ?? 0}
                  disabled={carouselLocked}
                  onQuantityChange={(next) => setProductQuantity(p.id, next)}
                />
              ))}
            </div>
          {phase === "pick" ? (
            <Button
              size="sm"
              className="mt-1 w-full"
              disabled={
                journey.products.reduce((sum, p) => sum + (cartQtyByProductId[p.id] ?? 0), 0) < 1
              }
              onClick={onContinue}
            >
              {journey.userContinueMessage}
            </Button>
          ) : null}
          </div>
        </AssistantBlock>
      ) : null}

      {showPayFlow ? (
        <>
          <UserBubble narrow={compact}>{journey.userContinueMessage}</UserBubble>
          <AssistantBlock narrow={compact}>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{journey.assistantPayIntro}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {journey.paySectionTitle}
            </p>
            <div className="mt-2 space-y-2">
              {journey.savedCards.slice(0, visibleCardCount).map((c) => (
                <CardRow
                  key={c.id}
                  card={c}
                  paying={phase === "paying"}
                  disabled={phase === "done" || (selectedCardId !== null && selectedCardId !== c.id)}
                  onPick={() => onCardPick(c.id)}
                />
              ))}
            </div>
          </AssistantBlock>
        </>
      ) : null}

      {phase === "done" ? (
        <AssistantBlock narrow={compact}>
          <div
            className={cn(
              "border bg-card p-4 shadow-sm",
              compact ? "rounded-3xl border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "rounded-2xl border-border"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{successTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{successBody}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span aria-hidden>📦</span> Your order is on its way.
                </p>
              </div>
            </div>
          </div>
        </AssistantBlock>
      ) : null}

    </div>
  );

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden",
        compact ? "bg-white" : "bg-white dark:bg-zinc-950"
      )}
    >
      {desktopChrome ? <DesktopChatChrome /> : <ChatChromeRow compact={compact} />}
      <div
        ref={threadScrollRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 [scrollbar-gutter:stable]",
          compact ? "bg-[#f4f4f5]" : "bg-muted/20 dark:bg-zinc-900/30"
        )}
      >
        {thread}
      </div>
      <div
        className={cn(
          "shrink-0 bg-white px-2 pb-3 pt-2",
          !compact && "border-t border-border bg-card dark:bg-zinc-950"
        )}
      >
        {compact ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white text-foreground shadow-sm transition-colors hover:bg-black/[0.03]"
              aria-label="Attach"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-[1.35rem] border border-transparent bg-[#ececec] px-3 py-2">
              <textarea
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!composerDisabled) onSend();
                  }
                }}
                disabled={composerDisabled}
                placeholder={journey.composerPlaceholder ?? "Ask anything"}
                rows={1}
                className={cn(
                  "max-h-24 min-h-[2.25rem] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-5 text-foreground placeholder:text-[#8e8e8e] focus:outline-none",
                  composerDisabled && "cursor-not-allowed opacity-60"
                )}
              />
              <button
                type="button"
                disabled={composerDisabled || !composeText.trim()}
                onClick={onSend}
                aria-label="Send message"
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors",
                  composeText.trim() && !composerDisabled ? "bg-foreground" : "bg-[#bdbdbd]"
                )}
              >
                <SendHorizontal className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-2 py-2 dark:bg-zinc-800/50">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!composerDisabled) onSend();
                }
              }}
              disabled={composerDisabled}
              placeholder={journey.composerPlaceholder ?? "Message…"}
              rows={1}
              className={cn(
                "max-h-24 min-h-[44px] min-w-0 flex-1 resize-none bg-transparent py-2 pl-2 pr-1 text-sm leading-snug text-foreground placeholder:text-muted-foreground focus:outline-none",
                composerDisabled && "cursor-not-allowed opacity-60"
              )}
            />
            <Button
              type="button"
              size="sm"
              className="h-10 shrink-0 gap-1.5 rounded-xl px-3.5"
              disabled={composerDisabled || !composeText.trim()}
              onClick={onSend}
              aria-label="Send message"
            >
              <SendHorizontal className="h-4 w-4 shrink-0" />
              <span>Send</span>
            </Button>
          </div>
        )}
      </div>

      {phase === "paying" ? <BrandedLoader reduceMotion={reduceMotion} fullDevice /> : null}
    </div>
  );
}

export function StorefrontPreviewJourney({
  journey,
  scenario,
  onScenarioChange,
  onRestartDemo,
}: {
  journey: PreviewJourney;
  scenario: PreviewScenario;
  onScenarioChange: (s: PreviewScenario) => void;
  onRestartDemo: () => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");
  const [phase, setPhase] = useState<Phase>("idle");
  const [composeText, setComposeText] = useState(journey.initialUserMessage);
  const [sentUserMessage, setSentUserMessage] = useState<string | null>(null);
  const [cartQtyByProductId, setCartQtyByProductId] = useState<Record<string, number>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [visibleCardCount, setVisibleCardCount] = useState(0);
  const staggerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setPhase("idle");
    setComposeText(journey.initialUserMessage);
    setSentUserMessage(null);
    setCartQtyByProductId({});
    setSelectedCardId(null);
    setVisibleCardCount(0);
  }, [journey]);

  const setProductQuantity = useCallback((productId: string, next: number) => {
    const q = Math.max(0, Math.min(99, next));
    setCartQtyByProductId((prev) => {
      if (q === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: q };
    });
  }, []);

  /** First line item in catalogue order (for success copy when multiple SKUs have qty). */
  const selectedProduct = useMemo(() => {
    for (const p of journey.products) {
      if ((cartQtyByProductId[p.id] ?? 0) > 0) return p;
    }
    return null;
  }, [journey.products, cartQtyByProductId]);

  const successBody = useMemo(() => {
    const name = selectedProduct?.name ?? "your item";
    return journey.successBodyTemplate.replace(/\{\{product\}\}/g, name);
  }, [journey.successBodyTemplate, selectedProduct?.name]);

  const clearStagger = useCallback(() => {
    staggerRef.current.forEach(clearTimeout);
    staggerRef.current = [];
  }, []);

  useEffect(() => {
    if (phase !== "pay") {
      setVisibleCardCount(0);
      clearStagger();
      return;
    }
    if (reduceMotion) {
      setVisibleCardCount(journey.savedCards.length);
      return;
    }
    setVisibleCardCount(0);
    const delays = [120, 480];
    journey.savedCards.forEach((_, i) => {
      const t = setTimeout(
        () => setVisibleCardCount((c) => Math.max(c, i + 1)),
        delays[i] ?? 400 + i * 360
      );
      staggerRef.current.push(t);
    });
    return clearStagger;
  }, [phase, journey.savedCards, reduceMotion, clearStagger]);

  const onSend = () => {
    const t = composeText.trim();
    if (!t || phase !== "idle") return;
    setSentUserMessage(t);
    setComposeText("");
    setPhase("pick");
  };

  const onContinue = () => {
    const anyQty = journey.products.some((p) => (cartQtyByProductId[p.id] ?? 0) > 0);
    if (!anyQty) return;
    setPhase("pay");
  };

  const onCardPick = (id: string) => {
    if (phase !== "pay") return;
    setSelectedCardId(id);
    setPhase("paying");
    const ms = reduceMotion ? 400 : 1600;
    window.setTimeout(() => {
      setPhase("done");
    }, ms);
  };

  const columnProps = {
    journey,
    phase,
    sentUserMessage,
    cartQtyByProductId,
    setProductQuantity,
    visibleCardCount,
    selectedCardId,
    onContinue,
    onCardPick,
    successBody,
    successTitle: journey.successTitleTemplate,
    reduceMotion,
    composeText,
    setComposeText,
    onSend,
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2 sm:pt-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">Live preview</h3>
          <Select value={scenario} onValueChange={(v) => onScenarioChange(v as PreviewScenario)}>
            <SelectTrigger className="h-9 w-[min(100%,200px)] sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Shopping + PayGlocal checkout</SelectItem>
              <SelectItem value="catalogue_unavailable">Catalogue unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
          <Button variant="outline" size="sm" type="button" onClick={onRestartDemo}>
            Restart demo
          </Button>
          <div
            className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5 dark:bg-zinc-800/80"
            role="group"
            aria-label="Preview viewport"
          >
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                viewport === "mobile"
                  ? "bg-white font-semibold text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={viewport === "mobile"}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                viewport === "desktop"
                  ? "bg-white font-semibold text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={viewport === "desktop"}
              aria-label="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex w-full justify-center",
          viewport === "mobile"
            ? "min-h-[min(672px,calc(100dvh-15rem))] items-center py-8 sm:min-h-[min(720px,calc(100dvh-13rem))] sm:py-10"
            : "items-start pt-1"
        )}
      >
        {viewport === "mobile" ? (
          <BrandingMobileFrame
            scrollBody={false}
            screenClassName="h-[min(672px,calc(72svh*1.2))] max-h-[min(92svh,calc(88svh*1.2))]"
          >
            <ChatColumn {...columnProps} compact desktopChrome={false} />
          </BrandingMobileFrame>
        ) : (
          <BrandingDesktopFrame
            fullBleedContent
            className="w-full min-w-0"
            addressBar="https://chat.example.com/merchant-storefront"
          >
            <ChatColumn {...columnProps} compact={false} desktopChrome />
          </BrandingDesktopFrame>
        )}
      </div>
    </div>
  );
}
