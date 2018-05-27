
import * as express from 'express'
import { json as jsonBodyParser } from 'body-parser'

import { db } from './db'

import { pubsub } from './services/client'
import { twilioClient } from './services/subscriptions'

// the docker node image exposes port 8080
// and maps tcp connections
// to port 80 in the vm
// see Docker-compose.yml under server.ports
const ports = {
  host: 8080,
  vm: 80
}

const init = async () => {
  const dbConnection = await db

  const pubSubClient = await pubsub(dbConnection)

  pubSubClient.subscribe('sms', (payload) => {
    return twilioClient.sendSMS(payload.msg)
  })

  const app = express()

  app.use(jsonBodyParser({ limit: '50mb' }))

  app.post('/users', async (req, res) => {
    const { first_name, last_name, email, cellphone } = req.body

    const bindings = [first_name, last_name, email, cellphone]

    await dbConnection.query(`
      INSERT INTO users (first_name, last_name, email, cellphone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, bindings)

    pubSubClient.publish('sms', { msg: `Welcome, ${first_name}!` })

    res.sendStatus(201)
  })

  app.listen(ports.vm, () => console.log(`Example app listening on port ${ports.host}!`))
}

init()
