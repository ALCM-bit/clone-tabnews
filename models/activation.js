import database from "infra/database";
import email from "infra/email";
import { ForbiddenError, NotFoundError } from "infra/erros";
import webserver from "infra/webserver";
import user from "models/user";
import authorization from "./authorization";

const EXPIRATION_IN_MILISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM
          user_activation_token
        WHERE
          id = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }
    return results.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
          user_activation_token (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING 
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_token
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "ByteTab <contato@bytetab.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no ByteTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no FinTab
${webserver.origin}/cadastro/ativar/${activationToken.id}
    
Atenciosamente,
Equipe FinTab`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILISECONDS,
};

export default activation;
