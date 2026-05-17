Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Enable image attachments in Full mode chat (Mid stays text-only). This spans backend schema change, multipart upload, Gemini image input, and mobile compose bar + message rendering.

**Backend schema**: `ConversationMessage.content` column type changes from `text` to `jsonb`. New format: `[{ "type": "text", "text": "..." }, { "type": "image", "url": "/uploads/images/abc.jpg" }]`. Migration converts old rows: string → `[{ "type": "text", "text": "<old_content>" }]`. Code reading content must handle both formats during transition (string → wrap, array → use as-is). AI and TOOL messages always have single text part.

**Backend upload**: `POST /ai/chat/stream` changes from JSON body to `multipart/form-data`. Fields: `message` (string), `conversationId` (optional UUID), `screenContext` (optional JSON string). Files: `images` (up to 4, each ≤10MB, MIME: image/jpeg, image/png, image/webp). Multer `FilesInterceptor('images', 4)` with file filter (MIME check) and size limit. For each image: `StorageService.uploadImage()` → save to `uploads/images/`, get URL. `uploadImage` mimetype hard-coding fix — derive from actual file mimetype. Build message content parts array. For Gemini input: read each image from disk, base64-encode, add as Step content part alongside text. Persist `ConversationMessage` with jsonb content. Non-streaming `POST /ai/chat/simple` updated similarly.

**Mobile compose bar** (Full only): camera/photo button beside text field. Tap → action sheet "Chụp ảnh" (camera) or "Chọn ảnh" (gallery). Selected images shown as horizontal thumbnail row above text field, each with X to remove. Max 4 images, each ≤10MB — validate before attaching.

**Mobile message rendering**: User messages with images render horizontal scrollable row of rounded thumbnails inside bubble. Tap thumbnail → fullscreen image viewer (dialog with zoom). AI messages remain text-only (markdown).

Mid compose bar does NOT get the camera/photo button — Mid stays text-only.

## Acceptance criteria

- [ ] `ConversationMessage.content` column is `jsonb` in entity definition
- [ ] Migration converts existing text content to `[{ type: "text", text: "<old>" }]`
- [ ] Content reader handles both formats: string (old) → wrap in array; array → use as-is
- [ ] `POST /ai/chat/stream` accepts `multipart/form-data` with `images` files
- [ ] Multer enforces max 4 files, ≤10MB each, MIME types jpeg/png/webp only
- [ ] `StorageService.uploadImage` derives mimetype from file instead of hard-coding `image/jpeg`
- [ ] Uploaded images saved to `uploads/images/`, URL stored in message content
- [ ] Gemini Interactions input includes base64-encoded image data alongside text
- [ ] Message persisted with jsonb content (text parts + image parts)
- [ ] `POST /ai/chat/simple` updated for multipart consistency
- [ ] Full compose bar has camera/photo button; Mid compose bar does NOT
- [ ] Action sheet offers "Chụp ảnh" (camera) and "Chọn ảnh" (gallery)
- [ ] Thumbnail preview row above text field; X button to remove each; max 4; 10MB client validation
- [ ] User message bubbles render image row (horizontal scroll, rounded thumbnails)
- [ ] Tap image → fullscreen viewer with zoom
- [ ] Unit tests: content parsing (text-only, text+images, old-format fallback), content builder, image upload pipeline (mock multer, StorageService, Gemini input), file validation (size, MIME, max 4)

## Blocked by

- .scratch/troly-ai-v2/issues/01-full-mode-independent-chat-surface.md (Full mode chat surface must exist)
