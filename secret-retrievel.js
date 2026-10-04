const {
    SecretsManagerClient,
    GetSecretValueCommand
  } = require("@aws-sdk/client-secrets-manager");
  
  const client = new SecretsManagerClient({
    region: "eu-north-1"
  });
  
  exports.handler = async (event) => {
  
    try {
  
      console.log("Retrieving secret...");
  
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: "prod/sample-db"
        })
      );
  
      if (!response.SecretString) {
        throw new Error("SecretString is empty");
      }
  
      const secret = JSON.parse(response.SecretString);
  
      console.log("Secret retrieved successfully");
  
      // Do NOT log the password
      console.log("Secret details:", {
        username: secret.username,
        engine: secret.engine,
        host: secret.host,
        port: secret.port,
        dbInstanceIdentifier: secret.dbInstanceIdentifier
      });
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Secret retrieved successfully",
          username: secret.username,
          engine: secret.engine,
          host: secret.host,
          port: secret.port,
          dbInstanceIdentifier: secret.dbInstanceIdentifier
        })
      };
  
    } catch (error) {
  
      console.error("Error retrieving secret:", error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to retrieve secret",
          error: error.message
        })
      };
    }
  };
