-- CreateTable
CREATE TABLE "Cartao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conta_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "limite" REAL NOT NULL,
    "dia_fechamento" INTEGER NOT NULL,
    "dia_vencimento" INTEGER NOT NULL,
    CONSTRAINT "Cartao_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "Conta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cartao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "conta_id" INTEGER,
    "cartao_id" INTEGER,
    "categoria_id" INTEGER NOT NULL,
    "terceiro_id" INTEGER,
    "valor" REAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "parcela_atual" INTEGER NOT NULL DEFAULT 1,
    "parcela_total" INTEGER NOT NULL DEFAULT 1,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "descricao" TEXT,
    "grupo_parcela_id" TEXT,
    CONSTRAINT "Transacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transacao_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "Conta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transacao_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "Cartao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transacao_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transacao_terceiro_id_fkey" FOREIGN KEY ("terceiro_id") REFERENCES "Terceiro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ativo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "ticker" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "preco_medio" REAL NOT NULL,
    "data_compra" DATETIME NOT NULL,
    CONSTRAINT "Ativo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor_limite" REAL NOT NULL,
    CONSTRAINT "Orcamento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orcamento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Usuario" ("admin", "ativo", "email", "id", "nome", "senha") SELECT "admin", "ativo", "email", "id", "nome", "senha" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
