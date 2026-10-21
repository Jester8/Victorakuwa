// Shared by server routes and client components, so no server-only imports here.

/** The first entry counts as a "like" in the admin dashboard. */
export const POST_REACTIONS = ["❤️", "🙏", "🔥", "👏", "😂", "😮"] as const;
export const COMMENT_REACTIONS = ["❤️", "🙏", "🔥", "😂"] as const;
export const LIKE_EMOJI = POST_REACTIONS[0];

export const SHARE_NETWORKS = [
  "x",
  "facebook",
  "whatsapp",
  "linkedin",
  "telegram",
  "copy",
  "native",
] as const;
export type ShareNetwork = (typeof SHARE_NETWORKS)[number];

export const COMMENT_NAME_MAX = 60;
export const COMMENT_BODY_MAX = 1500;

export type ReactionSummary = { counts: Record<string, number>; mine: string[] };

export type PublicComment = {
  id: number;
  name: string;
  body: string;
  gifUrl: string | null;
  createdAt: string;
  reactions: ReactionSummary;
};
