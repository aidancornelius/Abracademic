# CASA token detection

## What is CASA?

CASA (Campus-Activated Subscriber Access) is a protocol that allows seamless, IP-authenticated access to publisher content. When you access content from an authorised IP address (on campus or via VPN), publishers can issue cryptographically signed tokens that enable continued access even when off-campus.

## What Abracademic does

Abracademic detects existing CASA tokens to inform you when you already have access to content. This detection is **informational only**—the extension cannot generate CASA tokens, as they are cryptographically signed by publishers and can only be issued from authorised IP addresses.

## How CASA tokens work

1. **Token issuance**: When you access publisher content from an authorised IP (campus network or VPN), the publisher issues a CASA token
2. **Token storage**: The token is stored in browser cookies or local storage
3. **Off-campus access**: The token enables continued access for a limited time (typically 30-90 days)

## What the extension detects

The extension checks for common CASA token indicators:
- Cookies with CASA-related names (casa, subscriber_access, remote_access, etc.)
- HTTP headers like X-CASA-Token
- Publisher-specific authentication tokens

When a CASA token is detected, the extension displays this in the popup's "Last result" section.

## Limitations

- **Cannot generate tokens**: The extension can only detect existing tokens, not create new ones
- **Token validity**: The extension cannot determine if a detected token is still valid
- **Publisher-specific**: Different publishers use different CASA implementations
- **No token management**: The extension does not store, modify, or transfer CASA tokens

## Getting CASA tokens

To obtain CASA tokens:
1. Connect to your institution's network (on campus or via VPN)
2. Visit publisher websites and log in if prompted
3. Publishers will automatically issue CASA tokens
4. These tokens will persist when you disconnect from the VPN

## See also

- [CASA Protocol Specification](https://sites.google.com/site/casainfosite/)
- [Institutional access methods](../README.md#access-routing)
