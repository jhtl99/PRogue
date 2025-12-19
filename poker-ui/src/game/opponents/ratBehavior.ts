import type { OpponentBehavior } from "./types";

export const ratBehavior: OpponentBehavior = ({ toCall }) => {
  if (toCall > 0) {
    return { type: "call" };
  }

  return { type: "check" };
};
