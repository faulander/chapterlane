# ChapterLane for KOReader

## Usage

1. Copy `chapterlane.koplugin/` into KOReader's `plugins/` directory (for example, `koreader/plugins/chapterlane.koplugin/`), then restart KOReader. Enable **ChapterLane** under **Tools → More tools → Plugin management** if it is disabled. The plugin appears in the document menu under **More tools → ChapterLane** while a book is open.
2. In ChapterLane, add the book to your library. Open **Settings → Reading devices**, create a device key, and copy it immediately. The key cannot be displayed again.
3. Connect KOReader to the ChapterLane HTTPS origin over Wi-Fi. Either enter the origin and device key under **ChapterLane → Connection settings**, or use **Import connection file** as described below. The plugin stores the key in KOReader's local settings; protect backups of that file.
4. Choose **Link this book**. The picker starts with a fuzzy title search from the open document’s metadata (or its filename if no title is available), ranking close matches first. Use **Change search…** to edit or clear the query, or **Show all books** to remove the filter; these actions reuse the fetched library. Even when no titles match, the search controls remain available. Only planned and active books can be linked. Books with identical titles remain separate entries; check the author and displayed book ID before selecting. Repeat for each local document. A link is saved in that document’s KOReader sidecar settings.
5. Read normally. Progress is sent after 30 seconds without another page update, when closing the document, and when the network reconnects. **Sync now** sends the current position on demand. KOReader's percentage is sent as a whole number from 0 to 100; KOReader page numbers are not treated as ChapterLane page numbers. A planned book becomes active on its first progress update. **Mark completed** explicitly marks an active book completed on ChapterLane after confirmation; merely reaching the end in KOReader does not mark it completed.

Only forward progress is sent for each ChapterLane book from this device connection; the progress shown by ChapterLane when you link a book is used as an initial floor. The plugin does not pull progress back into KOReader. For a changed or incorrect link, use **Link this book** again. Changing the connection key or server invalidates existing document links; link books again. Revoking a key on the ChapterLane settings page immediately stops its access.

### Copy the key over USB

Create a plain UTF-8 file named chapterlane-connection.txt on your computer with **exactly two lines** (no labels or quotes):

    https://books.example.org
    PASTE_YOUR_DEVICE_KEY_HERE

Use your actual HTTPS origin on line 1 (no /api path) and the 43-character key copied from **Settings → Reading devices** on line 2. Copy the file over USB into KOReader's settings directory, beside chapterlane.lua (typically koreader/settings/chapterlane-connection.txt; the location varies by platform). With a book open, select **ChapterLane → Import connection file**. A successful import saves the connection and removes the transfer file from the device. Then use **Link this book**.

The transfer file and your computer's copy contain a working secret in plain text. Delete the computer copy after import; if deletion on the device fails, the plugin will tell you to remove it manually. An invalid file is left intact for correction. Do not share the file or put it in a synced/public folder. The persistent chapterlane.lua file also contains the key; if the device or backups are compromised, revoke the key in ChapterLane and create a replacement. An HTTP-only ChapterLane URL cannot be used; set up HTTPS first.

### Offline and errors

Unsent events are kept in `chapterlane.lua` in KOReader's settings directory and retried with the same event ID when connectivity returns or **Sync now** is used. A failed event stays queued; the plugin does not silently skip it. If **Sync now** reports `401`, verify the key or create a new one. A `404` means the book is no longer in this account's library. A `409` means its status changed to paused, dropped, or completed, or a completion was requested before it was active. Resolve the status in ChapterLane and retry. If an event is permanently invalid, **Discard pending updates** clears the entire unsent queue after confirmation; this loses those updates. HTTP redirects are not followed, so configure the final HTTPS origin rather than an HTTP URL or redirecting domain.

For a connection failure, check that the configured hostname exactly matches the HTTPS origin used in the browser. The app must answer GET /api/device/books on that hostname; a TLS handshake failure or DNS error means the request never reached ChapterLane. An HTTP status is shown even when a proxy returns non-JSON HTML. After correcting the USB file, import it again (or change Connection settings), then retry Link this book.

If KOReader still displays exactly `Network error`, it is running the older plugin: replace the entire `plugins/chapterlane.koplugin/` directory on the device with the current version and fully restart KOReader. Updating the server or the connection file does not update plugin code. The current plugin reports `Connection failed: <transport reason>` instead; that reason distinguishes a timeout from TLS and DNS failures. Check **Connection settings** for the saved server address; importing a new file is required to change an already-saved address.

## Implementation guide

The plugin uses KOReader's `WidgetContainer` plugin interface: `_meta.lua` supplies Plugin management metadata and `main.lua` registers a reader-only document menu in `init()`. Its document link is the ChapterLane `book_id` from `GET /api/device/books`, not a title heuristic. The document sidecar records `chapterlane_book_id` and `chapterlane_connection_id`; the connection ID changes with credentials so previous account links cannot be reused accidentally.

The book picker ranks title matches locally after one library fetch and never links automatically. It uses KOReader’s Unicode lowercase helper when available; on older releases it uses Lua’s ASCII lowercase, so non-ASCII case variants may need a manually adjusted query.

The global chapterlane.lua settings file stores server, token, connection_id, queue, last_sent, and completed. setConnection() applies the same validation and account isolation for keyboard entry and the two-line USB import; importConnection() deletes the transfer file only after saving. onPageUpdate debounces an automatic send; onCloseDocument records unsent progress even without networking; onReaderReady and onNetworkConnected replay queued events. percent() uses KOReader's paging/rolling getLastPercent(), converts the fraction to an integer percentage, and clamps it to 0–100. Progress events include status "active"; a separate explicit event uses status "completed". The plugin never auto-matches titles or auto-completes.

`enqueue()` persists a UUID and event before transmission. `drain()` sends the oldest event first via `POST /api/device/sync` with `Authorization: Bearer <key>`, removes it only after an `applied` or `duplicate` response, and persists the acknowledgement. A timeout after server commit therefore replays the same ID without duplicating history. A server rejection stops the queue; this preserves ordering until the user resolves or discards it. The API owns library/status validation and percent-history creation; see the repository root README for its request/response contract.

Development references: [KOReader Development Guide](https://koreader.rocks/doc/topics/Development_guide.md.html) and [KOReader source](https://github.com/koreader/koreader). Verify menu rendering, Wi-Fi events, and actual TLS behavior on a KOReader emulator or device; a Lua API smoke run does not exercise device firmware.
