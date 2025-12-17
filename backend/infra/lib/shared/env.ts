import 'dotenv/config'

type NodeEnv = 'development' | 'production'
const nodeEnvs = ['development', 'production']

const nodeEnv: NodeEnv = process.env.NODE_ENV as NodeEnv
if (!nodeEnv) {
  throw new Error("NODE_ENV variable not set !")
}
if (!nodeEnvs.includes(nodeEnv)) {
  throw new Error(`Invalid value for NODE_ENV : ${nodeEnv} `)
}

export default nodeEnv

