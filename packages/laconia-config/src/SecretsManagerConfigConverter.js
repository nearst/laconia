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
      )
    );

    return datas.map(res => {
      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      let secret;
      if ({}.hasOwnProperty.call(res, "SecretString")) {
        secret = res.SecretString;
        try {
          secret = JSON.parse(secret);
        } catch (_) {}
      } else {
        const buff = Buffer.from(res.SecretBinary, "base64");
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
