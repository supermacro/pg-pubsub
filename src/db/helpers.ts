import { Client, ClientBase } from 'pg'

const {
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_DB
} = process.env


// prevent race conditions between docker images
// alternative to wait-for-it.sh approach
const sleep5Seconds = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 5000)
})


export const createConnection = async (): Promise<ClientBase> => {
  const dbConnection = new Client(
    `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db/${POSTGRES_DB}`
  )

  await sleep5Seconds()
  await dbConnection.connect()

  return dbConnection
}
