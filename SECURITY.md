# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Portfolio Manager seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them privately by emailing: **shlatchz@gmail.com**

### 📧 What to Include

When reporting a vulnerability, please include:

1. **Description**: A clear description of the vulnerability
2. **Impact**: What an attacker could do with this vulnerability
3. **Reproduction**: Step-by-step instructions to reproduce the issue
4. **Environment**: Browser, OS, and application version details
5. **Proof of Concept**: If possible, include a minimal proof of concept

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix Development**: Within 2-4 weeks (depending on severity)
- **Release**: Security fixes are prioritized for immediate release

### 🏆 Recognition

We appreciate security researchers who help keep our users safe. With your permission, we'll:
- Credit you in the security advisory
- Mention you in release notes
- Add you to our security contributors list

## Security Best Practices

### For Users

#### API Key Security
- **Never commit API keys** to version control
- Store API keys in environment variables only
- Use the principle of least privilege for API access
- Regularly rotate API keys

#### Google Sheets Configuration
- Make spreadsheets **view-only** for the API key
- Use specific sheet ranges rather than full access
- Regularly review sheet permissions
- Consider using service accounts for production

#### Environment Security
- Keep `.env` files out of version control
- Use strong, unique API keys
- Regularly update dependencies
- Monitor for security advisories

### For Developers

#### Code Security
- Validate all inputs from external APIs
- Sanitize data before processing
- Use TypeScript for type safety
- Follow secure coding practices

#### Dependencies
- Regularly update dependencies
- Use `npm audit` to check for vulnerabilities
- Pin dependency versions in production
- Review security advisories for dependencies

## Known Security Considerations

### Data Handling
- **Financial Data**: All financial data is processed client-side
- **API Keys**: Stored in environment variables, never in code
- **External APIs**: Only read access to public market data
- **Google Sheets**: Read-only access to user's spreadsheet

### Network Security
- **HTTPS**: All external API calls use HTTPS
- **CORS**: Proper CORS configuration for API access
- **Proxy**: Development proxy for TASE API to avoid CORS issues

### Client-Side Security
- **XSS Protection**: React's built-in XSS protection
- **Input Validation**: All user inputs are validated
- **Error Handling**: Sensitive information not exposed in errors

## Security Features

### Built-in Protections
- ✅ Environment variable validation
- ✅ TypeScript type safety
- ✅ Input sanitization
- ✅ Error boundary protection
- ✅ Secure API key handling
- ✅ Read-only external API access

### Monitoring
- Console logging for debugging (development only)
- Error tracking for API failures
- Network request monitoring
- Performance monitoring

## Vulnerability Disclosure Policy

### Scope
This security policy applies to:
- The main Portfolio Manager application
- All related documentation
- Configuration examples
- Build and deployment scripts

### Out of Scope
- Third-party services (Google Sheets API, TASE API)
- User's local environment security
- Browser security issues
- Network infrastructure

### Safe Harbor
We support responsible disclosure and will not pursue legal action against researchers who:
- Make a good faith effort to avoid privacy violations
- Don't access or modify user data beyond what's necessary to demonstrate the vulnerability
- Don't perform attacks that could harm the service or its users
- Don't publicly disclose vulnerabilities before we've had a chance to fix them

## Security Updates

### Notification
Security updates will be announced through:
- GitHub Security Advisories
- Release notes with security tags
- Email notification to maintainers

### Severity Levels
- **Critical**: Immediate threat to user data or system integrity
- **High**: Significant security risk requiring prompt attention
- **Medium**: Moderate security risk with available workarounds
- **Low**: Minor security improvements

## Contact

For security-related questions or concerns:
- **Email**: shlatchz@gmail.com
- **Subject**: [SECURITY] Portfolio Manager - Brief Description
- **Response Time**: Within 48 hours

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
- [Google Sheets API Security](https://developers.google.com/sheets/api/guides/authorizing)

---

**Last Updated**: January 2024  
**Version**: 1.0 