type UserInfo = {
  total: number
  used: number
  available: number
  grants: {
    data: grantData[]
  }
}

interface grantData {
  effective_at: number
  expires_at: number
  grant_amount: number
  id: string
  object: string
  used_amount: number
}
