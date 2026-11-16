import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Aliases for the built-in /quit command. Edit this list to taste, then /reload.
const ALIASES = ["exit", "q"];

export default function (pi: ExtensionAPI) {
  for (const name of ALIASES) {
    pi.registerCommand(name, {
      description: "Quit Pi (alias for /quit)",
      handler: async (_args, ctx) => {
        ctx.shutdown();
      },
    });
  }
}
