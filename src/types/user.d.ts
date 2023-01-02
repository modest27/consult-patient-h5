export type User = {
  id: string
  account: string
  mobile: string
  avatar: string
  token: string
}

export type CodeType =
  | 'login'
  | 'register'
  | 'changeMobile'
  | 'forgetPassword'
  | 'bindMobile'
