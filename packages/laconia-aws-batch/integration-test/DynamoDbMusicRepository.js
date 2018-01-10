module.exports = class MusicRepository {
  constructor (dynamodb, documentClient) {
    this.dynamodb = dynamodb
    this.documentClient = documentClient
  }

  createTable () {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: 'Artist',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'Artist',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: 'Music'
    }

    return this.dynamodb.createTable(params).promise()
  }

  save (music) {
    const params = {
      Item: music,
      TableName: 'Music'
    }
    return this.documentClient.put(params).promise()
  }

  scan (limit) {
    let params = { TableName: 'Music' }
    if (limit) {
      params = Object.assign({Limit: limit}, params)
    }

    return this.documentClient.scan(params).promise()
      .then(data => {
        return data.Items
      })
  }
}
