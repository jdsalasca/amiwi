import type { AvatarStyle, Mood } from "./types";

export const assetByAvatarMood: Record<AvatarStyle, Record<Mood, string>> = {
  mochi: {
    happy: "/avatars/mochi/happy.svg",
    focus: "/avatars/mochi/focus.svg",
    tired: "/avatars/mochi/tired.svg",
    break: "/avatars/mochi/break.svg",
    celebrate: "/avatars/mochi/celebrate.svg",
  },
  cat_beta: {
    happy: "/avatars/cat/happy.svg",
    focus: "/avatars/cat/focus.svg",
    tired: "/avatars/cat/tired.svg",
    break: "/avatars/cat/break.svg",
    celebrate: "/avatars/cat/celebrate.svg",
  },
  anime90s: {
    happy: "/avatars/cloud/happy.svg",
    focus: "/avatars/cloud/focus.svg",
    tired: "/avatars/cloud/tired.svg",
    break: "/avatars/cloud/break.svg",
    celebrate: "/avatars/cloud/celebrate.svg",
  },
};
