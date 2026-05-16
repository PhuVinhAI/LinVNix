/**
 * Typed stream events emitted by `AgentService.runTurnStream`.
 *
 * The agent yields these at every interesting boundary of a turn; the AI
 * controller's SSE encoder converts them to wire-format SSE messages the
 * mobile client consumes.
 *
 * Keep the shape in sync with the PRD streaming protocol (see `PRD.md`,
 * "Streaming protocol — single SSE endpoint with typed events").
 */
export type StreamEvent =
  | ToolStartEvent
  | ToolResultEvent
  | TextChunkEvent
  | ProposeEvent
  | ErrorEvent
  | DoneEvent;

export interface ToolStartEvent {
  type: 'tool_start';
  name: string;
  displayName: string;
  args: Record<string, any>;
}

export interface ToolResultEvent {
  type: 'tool_result';
  name: string;
  ok: boolean;
}

export interface TextChunkEvent {
  type: 'text_chunk';
  text: string;
}

// `propose` is reserved for the propose-tools slice (#07). It is exported here
// so the encoder + protocol contract is locked in by the streaming tracer.
export interface ProposeEvent {
  type: 'propose';
  kind: string;
  title: string;
  description: string;
  endpoint: string;
  payload: Record<string, any>;
}

export interface ErrorEvent {
  type: 'error';
  code: string;
  message: string;
}

export interface DoneEvent {
  type: 'done';
  messageId: string;
  interrupted: boolean;
}
