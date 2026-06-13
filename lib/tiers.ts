export type TierInfo = {
  level: number;
  name: string | null;
  authorPrefix: string | null;
  amountEmoji: string;
  cardClass: string;
  nameBadgeClass: string | null;
  amountOuterClass: string;
  amountInnerClass: string | null;
  avatarClass: string;
};

export function getTierFromNebulosas(nebulosas: number): TierInfo {
  if (nebulosas >= 4_000_000) {
    return {
      level: 7,
      name: "Official Owner of Proclama",
      authorPrefix: null,
      amountEmoji: "🏆",
      cardClass: "tier-7-card",
      nameBadgeClass: "tier-7-name-badge",
      amountOuterClass: "tier-7-amount-outer",
      amountInnerClass: null,
      avatarClass: "tier-7-avatar",
    };
  }
  if (nebulosas >= 399_996) {
    return {
      level: 6,
      name: "Trillionaire",
      authorPrefix: "⭐",
      amountEmoji: "🚀",
      cardClass: "tier-6-card",
      nameBadgeClass: "tier-6-name-badge",
      amountOuterClass: "tier-6-amount-outer",
      amountInnerClass: "tier-6-amount-inner",
      avatarClass: "tier-6-avatar",
    };
  }
  if (nebulosas >= 3_996) {
    return {
      level: 5,
      name: "Billionaire",
      authorPrefix: "💎",
      amountEmoji: "💎",
      cardClass: "tier-5-card",
      nameBadgeClass: "tier-5-name-badge",
      amountOuterClass: "tier-5-amount-outer",
      amountInnerClass: "tier-5-amount-inner",
      avatarClass: "",
    };
  }
  if (nebulosas >= 396) {
    return {
      level: 4,
      name: "Millionaire",
      authorPrefix: "👑",
      amountEmoji: "💰",
      cardClass: "tier-4-card",
      nameBadgeClass: "tier-4-name-badge",
      amountOuterClass: "tier-4-amount-outer",
      amountInnerClass: null,
      avatarClass: "",
    };
  }
  if (nebulosas >= 116) {
    return {
      level: 3,
      name: "Centurion",
      authorPrefix: "⚔️",
      amountEmoji: "💎",
      cardClass: "tier-3-card",
      nameBadgeClass: "tier-3-name-badge",
      amountOuterClass: "tier-3-amount-outer",
      amountInnerClass: "tier-3-amount-inner",
      avatarClass: "",
    };
  }
  if (nebulosas >= 36) {
    return {
      level: 2,
      name: "Just a Tip",
      authorPrefix: null,
      amountEmoji: "💵",
      cardClass: "tier-2-card",
      nameBadgeClass: "tier-2-name-badge",
      amountOuterClass: "tier-2-amount-outer",
      amountInnerClass: null,
      avatarClass: "",
    };
  }
  if (nebulosas >= 16) {
    return {
      level: 1,
      name: "Conformist",
      authorPrefix: null,
      amountEmoji: "🪙",
      cardClass: "tier-1-card",
      nameBadgeClass: "tier-1-name-badge",
      amountOuterClass: "tier-1-amount-outer",
      amountInnerClass: null,
      avatarClass: "",
    };
  }
  return {
    level: 0,
    name: null,
    authorPrefix: null,
    amountEmoji: "",
    cardClass: "",
    nameBadgeClass: null,
    amountOuterClass: "",
    amountInnerClass: null,
    avatarClass: "",
  };
}

// Legacy: accepts monto in cents, converts to nebulosas then evaluates
export function getTier(montoCents: number): TierInfo {
  const nebulosas = montoCents / 25; // cents → dollars (/100) → nebulosas (/0.25) = /25
  return getTierFromNebulosas(nebulosas);
}
