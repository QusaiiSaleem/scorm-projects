import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// This is the entry point for Remotion CLI
// It registers our video composition so Remotion knows what to render
registerRoot(RemotionRoot);
