import { ClientBase } from 'pg'
import { createConnection } from '../db/helpers'

import { twilioClient } from './subscriptions'

type PubSubPayload = {
  email: EmailPayload
  instant_messaging: IMPayload
  sms: SMSPayload
  scheduling: SchedulingPayload
}

type Channel = keyof PubSubPayload

export type EmailType
  = 'purchase_order'
  | 'client_welcome'

export interface EmailPayload {
  email_type: EmailType
  receiver: string
}

interface IMPayload {
  msg: string
}

interface SMSPayload {
  msg: string
}

interface SchedulingPayload {
  start: Date
  end: Date
}


const publisher = (db: ClientBase) => async (channel: Channel, payload: PubSubPayload[Channel]) => {
	await db.query(`
	  INSERT INTO db_events (channel, payload)
    VALUES ($1, $2)
  `,
   [channel, JSON.stringify(payload)]
  )
}

type SubscriptionHandler<C extends keyof PubSubPayload> = (payload: PubSubPayload[C]) => Promise<void>

type SubscriptionState = {
  [K in keyof PubSubPayload]?: Array<SubscriptionHandler<K>>
}

const subscriptionManager: SubscriptionState = {}
const subscriber = (db: ClientBase) => <C extends keyof PubSubPayload>(channel: C, cb: (payload: PubSubPayload[C]) => Promise<any>) => {
  if (subscriptionManager[channel]) {
    subscriptionManager[channel] = [
      ...subscriptionManager[channel],
      cb
    ]
  } else {
		subscriptionManager[channel] = [cb]
  }
}

export const pubsub = async (db) => {
  const pubSubConnection = await createConnection()

  await pubSubConnection.query('LISTEN pub_sub')

  pubSubConnection.on('notification', function(msg) {
    if (msg.channel === 'pub_sub') {
      const pl = JSON.parse(msg.payload);

      // HANDLE BUSINESS LOGIC HERE:
      //
      // Would need a switch statement
      // or something similar to handle
      // the various messaging channels
      // as defined by the Channel type alias
      console.log('> payload')
      console.log(pl)
      if (pl.channel === 'sms') {
        if (subscriptionManager['sms']) {
          Promise.all(subscriptionManager['sms'].map(f => f(pl)))
          .then(() =>
            pubSubConnection.query('DELETE FROM db_events WHERE id = $1', [pl.id])
          )
        }
      }
    }
  })

  return {
    publish: publisher(db),
    subscribe: subscriber(db)
  }
}
