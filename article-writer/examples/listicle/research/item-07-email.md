# Research: Listmonk - Email/Newsletters

## Key Facts
- 19K GitHub stars, written in Go
- Single binary deployment
- Handles millions of subscribers
- Multi-threaded, multi-SMTP email queues
- SQL-based subscriber segmentation
- Built-in analytics: campaign performance, bounces, top links
- Template options: drag-and-drop, WYSIWYG, Markdown, raw HTML
- Transactional emails via API
- v6.0.0 released Jan 2026
- S3-compatible media storage
- Role-based permissions and API tokens

## Cost Model
- Free software, only pay for SMTP (e.g., Amazon SES at ~$0.10/1000 emails)
- vs Mailchimp Standard: starts $20/month for 500 contacts

## Trade-offs
- Minimal template ecosystem vs Mailchimp
- No visual automation builder
- Requires technical setup (Docker, SMTP config)

## Sources
- https://github.com/knadh/listmonk
- https://listmonk.app/
