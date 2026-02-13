/**
 * cURL command parser
 * Parses a cURL command string and extracts HTTP request details.
 */

export type ParsedCurl = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers: Record<string, string>
  body: string | null
  bodyJson: Record<string, any> | null
  authType: 'none' | 'api_key' | 'oauth2' | 'service'
  authValue: string | null
}

/**
 * Tokenize a cURL command string, respecting quotes and backslash escapes.
 * Handles single-quoted, double-quoted, and $'...' strings.
 * Strips line-continuation backslashes (\↵) before tokenizing.
 */
const tokenize = (input: string): string[] => {
  // Normalize: remove line continuations (backslash + newline), collapse whitespace
  const normalized = input
    .replace(/\\\r?\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim()

  const tokens: string[] = []
  let current = ''
  let i = 0

  while (i < normalized.length) {
    const ch = normalized[i]

    // Skip whitespace between tokens
    if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
      i++
      continue
    }

    // Double-quoted string
    if (ch === '"') {
      i++ // skip opening "
      while (i < normalized.length && normalized[i] !== '"') {
        if (normalized[i] === '\\' && i + 1 < normalized.length) {
          // Escaped char inside double quotes
          const next = normalized[i + 1]
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next
            i += 2
          } else {
            current += normalized[i]
            i++
          }
        } else {
          current += normalized[i]
          i++
        }
      }
      i++ // skip closing "
      continue
    }

    // Single-quoted string (no escaping inside)
    if (ch === '\'') {
      i++ // skip opening '
      while (i < normalized.length && normalized[i] !== '\'') {
        current += normalized[i]
        i++
      }
      i++ // skip closing '
      continue
    }

    // $'...' strings (bash ANSI-C quoting)
    if (ch === '$' && i + 1 < normalized.length && normalized[i + 1] === '\'') {
      i += 2 // skip $'
      while (i < normalized.length && normalized[i] !== '\'') {
        if (normalized[i] === '\\' && i + 1 < normalized.length) {
          const esc = normalized[i + 1]
          if (esc === 'n') { current += '\n'; i += 2 }
          else if (esc === 't') { current += '\t'; i += 2 }
          else if (esc === '\\') { current += '\\'; i += 2 }
          else if (esc === '\'') { current += '\''; i += 2 }
          else { current += normalized[i]; i++ }
        } else {
          current += normalized[i]
          i++
        }
      }
      i++ // skip closing '
      continue
    }

    // Regular character
    if (ch === '\\' && i + 1 < normalized.length) {
      // Backslash escape outside quotes
      current += normalized[i + 1]
      i += 2
    } else {
      current += ch
      i++
    }
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

/**
 * Detect HTTP method from cURL headers / body presence
 */
const inferMethod = (hasData: boolean, explicitMethod: string | null): ParsedCurl['method'] => {
  if (explicitMethod) {
    const upper = explicitMethod.toUpperCase()
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)) {
      return upper as ParsedCurl['method']
    }
  }
  return hasData ? 'POST' : 'GET'
}

/**
 * Detect auth type from headers
 */
const detectAuth = (headers: Record<string, string>): { type: ParsedCurl['authType']; value: string | null } => {
  const authHeader = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'authorization'
  )

  if (!authHeader) return { type: 'none', value: null }

  const [, value] = authHeader
  if (value.toLowerCase().startsWith('bearer ')) {
    return { type: 'api_key', value: value.slice(7) }
  }
  if (value.toLowerCase().startsWith('basic ')) {
    return { type: 'api_key', value }
  }

  return { type: 'api_key', value }
}

/**
 * Parse a cURL command string into structured data.
 */
export const parseCurl = (curlString: string): ParsedCurl => {
  const tokens = tokenize(curlString)

  let url = ''
  let explicitMethod: string | null = null
  const headers: Record<string, string> = {}
  let data: string | null = null
  let basicAuth: string | null = null

  let i = 0

  // Skip 'curl' if first token
  if (tokens.length > 0 && tokens[0].toLowerCase() === 'curl') {
    i = 1
  }

  while (i < tokens.length) {
    const token = tokens[i]

    // Method: -X POST / --request POST
    if ((token === '-X' || token === '--request') && i + 1 < tokens.length) {
      explicitMethod = tokens[i + 1]
      i += 2
      continue
    }

    // Header: -H "Key: Value" / --header "Key: Value"
    if ((token === '-H' || token === '--header') && i + 1 < tokens.length) {
      const headerStr = tokens[i + 1]
      const colonIdx = headerStr.indexOf(':')
      if (colonIdx > 0) {
        const key = headerStr.slice(0, colonIdx).trim()
        const value = headerStr.slice(colonIdx + 1).trim()
        headers[key] = value
      }
      i += 2
      continue
    }

    // Data: -d / --data / --data-raw / --data-binary / --data-urlencode
    if (
      (token === '-d' || token === '--data' || token === '--data-raw' ||
       token === '--data-binary' || token === '--data-urlencode') &&
      i + 1 < tokens.length
    ) {
      data = tokens[i + 1]
      i += 2
      continue
    }

    // Basic auth: -u user:pass / --user user:pass
    if ((token === '-u' || token === '--user') && i + 1 < tokens.length) {
      basicAuth = tokens[i + 1]
      i += 2
      continue
    }

    // Flags without values (skip)
    if (
      token === '-k' || token === '--insecure' ||
      token === '-L' || token === '--location' ||
      token === '-s' || token === '--silent' ||
      token === '-S' || token === '--show-error' ||
      token === '-v' || token === '--verbose' ||
      token === '-i' || token === '--include' ||
      token === '--compressed' || token === '-g' || token === '--globoff'
    ) {
      i++
      continue
    }

    // Flags with values we don't care about (skip pair)
    if (
      (token === '-o' || token === '--output' ||
       token === '-w' || token === '--write-out' ||
       token === '--connect-timeout' || token === '--max-time' ||
       token === '-m' || token === '--retry' ||
       token === '--cacert' || token === '--capath' ||
       token === '-e' || token === '--referer' ||
       token === '-A' || token === '--user-agent' ||
       token === '--cookie' || token === '-b') &&
      i + 1 < tokens.length
    ) {
      // User-Agent is actually useful, capture it
      if (token === '-A' || token === '--user-agent') {
        headers['User-Agent'] = tokens[i + 1]
      }
      i += 2
      continue
    }

    // URL (anything that looks like a URL or doesn't start with -)
    if (!token.startsWith('-') && !url) {
      url = token
      i++
      continue
    }

    // Unknown flag, skip
    i++
  }

  // Add basic auth as Authorization header
  if (basicAuth) {
    const encoded = typeof btoa !== 'undefined'
      ? btoa(basicAuth)
      : Buffer.from(basicAuth).toString('base64')
    headers['Authorization'] = `Basic ${encoded}`
  }

  // Try to parse body as JSON
  let bodyJson: Record<string, any> | null = null
  if (data) {
    try {
      bodyJson = JSON.parse(data)
    } catch {
      // Not JSON — could be form data or plain text
      bodyJson = null
    }
  }

  const method = inferMethod(!!data, explicitMethod)
  const auth = detectAuth(headers)

  return {
    url,
    method,
    headers,
    body: data,
    bodyJson,
    authType: auth.type,
    authValue: auth.value
  }
}
