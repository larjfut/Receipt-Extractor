const { z } = require('zod')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('5000'),
  DEMO_MODE: z.string().transform(v => v === 'true').default('false'),
  AUTH_PROVIDER: z.enum(['msal', 'local']).default('msal'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  TENANT_ID: z.string().optional(),
  CLIENT_ID: z.string().optional(),
  AZURE_DOC_INTELLIGENCE_ENDPOINT: z.string().optional(),
  AZURE_DOC_INTELLIGENCE_KEY: z.string().optional()
})

const parsed = envSchema.parse(process.env)

if (!parsed.DEMO_MODE) {
  if (parsed.AUTH_PROVIDER === 'local' && !parsed.JWT_SECRET)
    throw new Error('JWT_SECRET required when AUTH_PROVIDER=local')
  if (parsed.AUTH_PROVIDER === 'msal') {
    if (!parsed.TENANT_ID || !parsed.CLIENT_ID)
      throw new Error('TENANT_ID and CLIENT_ID required when AUTH_PROVIDER=msal')
  }
  if (!parsed.AZURE_DOC_INTELLIGENCE_ENDPOINT || !parsed.AZURE_DOC_INTELLIGENCE_KEY)
    throw new Error('Azure Document Intelligence credentials required in production')
}

module.exports = parsed
