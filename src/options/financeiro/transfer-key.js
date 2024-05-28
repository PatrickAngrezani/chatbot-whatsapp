const cnpj = require("../general/cnpj");

const transferKey = `2 - Chave PIX da Empresa/Pagamento:

Para pagamentos via chave PIX basta efetuar o pagamento em nosso CNPJ: ${cnpj}

*Lembre-se de nos enviar o comprovante de pagamento para darmos baixa em sua cobrança.
Caso não envie, sua cobrança continuará em aberta.*

Fico à disposição.`;

module.exports = transferKey;
