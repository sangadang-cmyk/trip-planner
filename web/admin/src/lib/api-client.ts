import { client } from '@/generated/api/client.gen'
import { getAccessToken } from '@/lib/auth'

client.setConfig({
  auth: () => getAccessToken() ?? undefined,
})
