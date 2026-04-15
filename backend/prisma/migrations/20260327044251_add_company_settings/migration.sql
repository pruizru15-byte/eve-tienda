-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "about_innovation" TEXT NOT NULL DEFAULT 'Innovación con Propósito',
    "about_team" TEXT NOT NULL DEFAULT 'Nuestro Equipo',
    "about_mission" TEXT NOT NULL DEFAULT 'Misión',
    "about_values" TEXT NOT NULL DEFAULT 'Valores',
    "about_innovation_text" TEXT NOT NULL DEFAULT 'En NovaTech, no solo vendemos tecnología, construimos el futuro de tu negocio con pasión y excelencia técnica.',
    "about_team_text" TEXT NOT NULL DEFAULT 'Expertos multidisciplinarios en desarrollo, diseño y análisis de datos enfocados en tu éxito.',
    "about_mission_text" TEXT NOT NULL DEFAULT 'Empoderar a empresas y estudiantes mediante soluciones digitales de vanguardia y asesoría académica de alto nivel.',
    "about_values_text" TEXT NOT NULL DEFAULT 'Transparencia, innovación constante y compromiso inquebrantable con la calidad en cada entrega.',
    "contact_email" TEXT NOT NULL DEFAULT 'hola@novatech.com',
    "contact_phone" TEXT NOT NULL DEFAULT '+1 234 567 890',
    "contact_location" TEXT NOT NULL DEFAULT 'Distrito Tecnológico, Silicon Valley',
    "social_facebook" TEXT NOT NULL DEFAULT '#',
    "social_instagram" TEXT NOT NULL DEFAULT '#',
    "social_twitter" TEXT NOT NULL DEFAULT '#',
    "social_linkedin" TEXT NOT NULL DEFAULT '#',
    "social_github" TEXT NOT NULL DEFAULT '#',
    "target_email" TEXT NOT NULL DEFAULT 'admin@novatech.com',
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HelpSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactMessage" ("created_at", "id", "message", "sender_email", "sender_name", "status", "subject") SELECT "created_at", "id", "message", "sender_email", "sender_name", "status", "subject" FROM "ContactMessage";
DROP TABLE "ContactMessage";
ALTER TABLE "new_ContactMessage" RENAME TO "ContactMessage";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_expires" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "last_activity" DATETIME,
    "last_page_view" TEXT,
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "total_spent" REAL NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted_at" DATETIME
);
INSERT INTO "new_User" ("avatar_url", "created_at", "email", "id", "is_active", "is_online", "is_verified", "last_activity", "last_page_view", "name", "password_hash", "reset_expires", "reset_token", "role", "total_spent", "verification_token", "visit_count") SELECT "avatar_url", "created_at", "email", "id", "is_active", "is_online", "is_verified", "last_activity", "last_page_view", "name", "password_hash", "reset_expires", "reset_token", "role", "total_spent", "verification_token", "visit_count" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
