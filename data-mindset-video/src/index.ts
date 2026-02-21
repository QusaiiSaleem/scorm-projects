/**
 * Entry point for Remotion.
 * This file is referenced by the CLI commands (preview, render).
 * registerRoot() tells Remotion which React component defines the compositions.
 */
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
