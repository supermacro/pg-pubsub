
import * as express from 'express'
import { json as jsonBodyParser } from 'body-parser'

import { db } from './db'

import { pubsub } from './services/client'
import { twilioClient } from './services/subscriptions'

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

  app.listen(80, () => console.log('Example app listening on port 3000!'))
}

init()
