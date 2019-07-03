module.exports = class SecretsManagerConfigConverter {
  constructor(secretsManager) {
    this.secretsManager = secretsManager;
  }

  async _getParameterMap(secretIds) {
    const datas = await Promise.all(
      secretIds.map(secretId =>
        this.secretsManager
          .getSecretValue({
            SecretId: secretId
          })
          .promise()
          .catch(err => {
            if (err.code === "ResourceNotFoundException") {
              return undefined;
            }

            throw err;
          })
      )
    );

    return datas.map(res => {
      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      if (!res) {
        return undefined;
      }
      let secret;
      if (res.hasOwnProperty("SecretString")) {
        secret = res.SecretString;
      } else {
        let buff = Buffer.from(res.SecretBinary, "base64");
        secret = buff.toString("ascii");
      }

      return secret;
    });
  }

  async convertMultiple(values) {
    const secretsMap = await this._getParameterMap(Object.values(values));

    return Object.keys(values).reduce((acc, key, index) => {
      acc[key] = secretsMap[index];
      return acc;
    }, {});
  }
};
