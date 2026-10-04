const {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
  DescribeSecretCommand,
  UpdateSecretVersionStageCommand
} = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
  region: "eu-north-1"
});


exports.handler = async (event) => {

  console.log("Rotation event:", JSON.stringify({
    Step: event.Step,
    SecretId: event.SecretId,
    ClientRequestToken: event.ClientRequestToken
  }));

  const secretId = event.SecretId;
  const token = event.ClientRequestToken;

  switch (event.Step) {

    case "createSecret":
      return await createSecret(secretId, token);

    case "setSecret":
      return await setSecret(secretId, token);

    case "testSecret":
      return await testSecret(secretId, token);

    case "finishSecret":
      return await finishSecret(secretId, token);

    default:
      throw new Error(Invalid rotation step: ${event.Step});
  }
};


async function getSecret(secretId, stage, token) {

  const params = {
    SecretId: secretId,
    VersionStage: stage
  };

  if (token) {
    params.VersionId = token;
  }

  const response = await client.send(
    new GetSecretValueCommand(params)
  );

  return JSON.parse(response.SecretString);
}


async function createSecret(secretId, token) {

  console.log("createSecret started");

  const current = await getSecret(
    secretId,
    "AWSCURRENT"
  );

  console.log("Current secret retrieved:", {
    username: current.username,
    host: current.host,
    port: current.port
  });

  const pending = {
    ...current,
    password: generatePassword()
  };

  await client.send(
    new PutSecretValueCommand({
      SecretId: secretId,
      ClientRequestToken: token,
      SecretString: JSON.stringify(pending),
      VersionStages: ["AWSPENDING"]
    })
  );

  console.log("AWSPENDING created");
}


async function setSecret(secretId, token) {

  console.log("setSecret started");

  const current = await getSecret(
    secretId,
    "AWSCURRENT"
  );

  const pending = await getSecret(
    secretId,
    "AWSPENDING",
    token
  );

  console.log("Current credentials retrieved");
  console.log("Pending credentials retrieved");

  /*
   * WITHOUT mysql2:
   *
   * We cannot execute:
   *
   * ALTER USER ... IDENTIFIED BY ...
   *
   * against MySQL.
   */

  console.log(
    "MySQL password change requires a MySQL client."
  );

  throw new Error(
    "Cannot change MySQL password without a MySQL client such as mysql2."
  );
}


async function testSecret(secretId, token) {

  console.log("testSecret started");

  const pending = await getSecret(
    secretId,
    "AWSPENDING",
    token
  );

  console.log("Pending secret retrieved:", {
    username: pending.username,
    host: pending.host,
    port: pending.port
  });

  /*
   * A real test requires connecting to MySQL.
   */

  throw new Error(
    "Cannot test MySQL credentials without a MySQL client."
  );
}


async function finishSecret(secretId, token) {

  console.log("finishSecret started");

  const metadata = await client.send(
    new DescribeSecretCommand({
      SecretId: secretId
    })
  );

  const versions =
    metadata.VersionIdsToStages || {};

  let currentVersion;

  for (const [versionId, stages]
       of Object.entries(versions)) {

    if (stages.includes("AWSCURRENT")) {
      currentVersion = versionId;
      break;
    }
  }

  if (currentVersion === token) {
    return {
      message: "Already AWSCURRENT"
    };
  }

  await client.send(
    new UpdateSecretVersionStageCommand({
      SecretId: secretId,
      VersionStage: "AWSCURRENT",
      MoveToVersionId: token,
      RemoveFromVersionId: currentVersion
    })
  );

  console.log("Rotation completed");

  return {
    message: "Rotation completed"
  };
}


function generatePassword() {

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789" +
    "!@#$%^&*";

  let password = "";

  for (let i = 0; i < 24; i++) {
