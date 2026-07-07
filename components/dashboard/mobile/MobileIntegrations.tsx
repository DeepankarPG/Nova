"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useMobileOverlay } from "@/components/dashboard/mobile/MobileOverlayContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  externalUrl: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "tally",
    name: "Tally",
    description: "Collect payments via Tally forms",
    icon: FileText,
    iconColor: "#5856D6",
    externalUrl: "https://tally.so",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync orders and payments",
    icon: ShoppingBag,
    iconColor: "#96BF48",
    externalUrl: "https://shopify.com",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Accept payments on WooCommerce",
    icon: ShoppingCart,
    iconColor: "#7F54B3",
    externalUrl: "https://woocommerce.com",
  },
  {
    id: "zoho-books",
    name: "Zoho Books",
    description: "Sync invoices and settlements",
    icon: BookOpen,
    iconColor: "#E8523A",
    externalUrl: "https://zoho.com/books",
  },
];

function ConnectSheet({
  integration,
  onConnected,
  onClose,
}: {
  integration: IntegrationDef;
  onConnected: () => void;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const beginClose = useCallback(() => setVisible(false), []);

  const handleContinue = () => {
    onConnected();
    beginClose();
  };

  return (
    <div className="absolute inset-0 z-10">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={beginClose}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl overflow-hidden"
        style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
        initial={{ y: "100%" }}
        animate={{ y: visible ? 0 : "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onAnimationComplete={() => { if (!visible) onClose(); }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[17px] font-bold text-foreground">
            Connect {integration.name}
          </span>
          <button
            type="button"
            onClick={beginClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-muted active:opacity-60 transition-opacity shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground/70" strokeWidth={2} />
          </button>
        </div>

        <p className="px-5 pb-5 text-[14px] text-muted-foreground leading-snug">
          You'll be redirected to {integration.name} to authorise the connection.
        </p>

        <div className="px-5 space-y-3">
          <Button
            variant="primary"
            type="button"
            className="w-full h-13 rounded-xl text-sm font-semibold"
            onClick={handleContinue}
          >
            Continue to {integration.name}
          </Button>
          <button
            type="button"
            onClick={beginClose}
            className="w-full h-13 rounded-xl border border-[#E2E8F2] text-[15px] font-medium text-foreground active:bg-muted/40 transition-colors flex items-center justify-center"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function MobileIntegrations() {
  const { pushOverlay, popOverlay } = useMobileOverlay();
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const openConnectSheet = (integration: IntegrationDef) => {
    pushOverlay(
      <ConnectSheet
        integration={integration}
        onConnected={() =>
          setConnected((prev) => new Set([...prev, integration.id]))
        }
        onClose={popOverlay}
      />,
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1">
        Available integrations
      </p>
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {INTEGRATIONS.map((integration, i) => {
          const Icon = integration.icon;
          const isConnected = connected.has(integration.id);
          return (
            <div key={integration.id}>
              <button
                type="button"
                onClick={() => !isConnected && openConnectSheet(integration)}
                disabled={isConnected}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 text-left transition-colors",
                  !isConnected && "active:bg-muted/40",
                )}
                style={{ minHeight: 60 }}
              >
                <div
                  className="h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#F5F7FA" }}
                >
                  <Icon
                    style={{ height: 18, width: 18, color: integration.iconColor }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex-1 min-w-0 py-3">
                  <p className="text-[15px] font-semibold text-foreground leading-tight">
                    {integration.name}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: "#8A97AB" }}>
                    {integration.description}
                  </p>
                </div>
                {isConnected ? (
                  <span
                    className="shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                  >
                    Connected
                  </span>
                ) : (
                  <span className="shrink-0 text-[14px] font-semibold text-primary">
                    Connect
                  </span>
                )}
              </button>
              {i < INTEGRATIONS.length - 1 && (
                <div className="h-px bg-border/40 ml-[62px]" />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[13px] px-1" style={{ color: "#8A97AB" }}>
        More integrations coming soon.
      </p>
    </div>
  );
}
