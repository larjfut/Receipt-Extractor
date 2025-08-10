const { z } = require('zod')

const lowerHttpProxy = process.env.http_proxy
const lowerHttpsProxy = process.env.https_proxy
if (lowerHttpProxy && !process.env.HTTP_PROXY) {
  process.env.HTTP_PROXY = lowerHttpProxy
  delete process.env.http_proxy
}
if (lowerHttpsProxy && !process.env.HTTPS_PROXY) {
  process.env.HTTPS_PROXY = lowerHttpsProxy
  delete process.env.https_proxy
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('5000'),
  DEMO_MODE: z.string().transform(v => v === 'true').default('false'),
  AUTH_PROVIDER: z.enum(['msal', 'local']).default('msal'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  TENANT_ID: z.string().optional(),
  CLIENT_ID: z.string().optional(),
  AZURE_DOC_INTELLIGENCE_ENDPOINT: z.string().optional(),
  AZURE_DOC_INTELLIGENCE_KEY: z.string().optional(),
  HTTP_PROXY: z.string().optional(),
  HTTPS_PROXY: z.string().optional()
})

const parsed = envSchema.parse(process.env)

if (!parsed.HTTP_PROXY && !parsed.HTTPS_PROXY)
  console.log('HTTP(S)_PROXY not set; outgoing requests will not use a proxy')

if (!parsed.DEMO_MODE) {
  if (parsed.AUTH_PROVIDER === 'local' && !parsed.JWT_SECRET) {
    console.warn(
      'JWT_SECRET required when AUTH_PROVIDER=local; using insecure default'
    )
    parsed.JWT_SECRET = parsed.JWT_SECRET || 'change_me'
  }
  if (parsed.AUTH_PROVIDER === 'msal') {
    if (!parsed.TENANT_ID || !parsed.CLIENT_ID) {
      console.warn(
        'TENANT_ID and CLIENT_ID required when AUTH_PROVIDER=msal; using empty defaults'
      )
      parsed.TENANT_ID = parsed.TENANT_ID || ''
      parsed.CLIENT_ID = parsed.CLIENT_ID || ''
    }
  }
  if (!parsed.AZURE_DOC_INTELLIGENCE_ENDPOINT || !parsed.AZURE_DOC_INTELLIGENCE_KEY) {
    console.warn(
      'Azure Document Intelligence credentials missing; some features may be disabled'
    )
    parsed.AZURE_DOC_INTELLIGENCE_ENDPOINT =
      parsed.AZURE_DOC_INTELLIGENCE_ENDPOINT || ''
    parsed.AZURE_DOC_INTELLIGENCE_KEY = parsed.AZURE_DOC_INTELLIGENCE_KEY || ''
  }
}

module.exports = parsed
