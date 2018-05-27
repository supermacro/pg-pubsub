// have your 3rd party api service wrappers here. Examples:
// email
// slack
// sms (twilio)
// etc ...


// fake twilio client
const twilio = (token: string) => ({
  sendSMS: (msg: string) => new Promise((resolve, reject) => {
    console.log('> Twilio: sending sms')
    resolve()
  })
})

export const twilioClient = twilio('fakecredentials')
