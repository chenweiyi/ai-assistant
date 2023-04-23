declare namespace Common {
  export interface Response<Data> {
    code: number
    msg: string
    data: Data
    success: boolean
  }
}
