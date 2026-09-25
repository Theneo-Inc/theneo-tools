---
"@theneo/sdk": patch
"@theneo/cli": patch
---

Show friendly, readable messages for gateway errors instead of raw HTML. `413 Request Entity Too Large` on import now explains the upload-size limit, and `503 Service Temporarily Unavailable` when fetching projects now reports that the service is temporarily unavailable. Any other HTML error body is mapped to a clean status message rather than being printed verbatim.
