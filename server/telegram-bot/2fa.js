const EXP_TIME = 60

const dict = {}

const getExpiration = ts => {
  return EXP_TIME - Math.floor((+new Date() - ts) / 1000)
}

const generate = chatId => {
  const code = {
    code: Math.floor(1000 + Math.random() * 8999),
    at: +new Date(),
  }

  dict[chatId] = code

  return code
}

const getCode = chatId => {
  const code = dict[chatId]

  if (!code || getExpiration(code.at) <= 0) {
    return generate(chatId)
  } else {
    return code
  }
}

const validateCode = (chatId, code) => {
  const codeEntity = dict[chatId]
  const valid = codeEntity && codeEntity.code == code && getExpiration(codeEntity.at) > 0

  if(valid) {
    generate(chatId)
  }

  return valid
}

module.exports = {
  getCode,
  validateCode,
  getExpiration,
}
