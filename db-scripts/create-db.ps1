# Check if MySQL is installed
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Host "MySQL is not installed. Please install MySQL and try again."
    exit 1
}

# Prompt for MySQL credentials and database name
$MYSQL_USER = Read-Host "Enter your MySQL username"
$MYSQL_PASSWORD = Read-Host -AsSecureString "Enter your MySQL password"
$MYSQL_HOST = Read-Host "Enter MySQL host (default: 127.0.0.1)"
if (-not $MYSQL_HOST) { $MYSQL_HOST = "127.0.0.1" }
$MYSQL_DB = Read-Host "Enter the database name you want to create"

# Convert secure string to plain text
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($MYSQL_PASSWORD)
$MYSQL_PASSWORD_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Create database and tables
$SQL_COMMANDS = @"
CREATE DATABASE IF NOT EXISTS $MYSQL_DB;
USE $MYSQL_DB;

CREATE TABLE IF NOT EXISTS \`Role\` (
    \`id\` varchar(36) NOT NULL DEFAULT(uuid()),
    \`name\` varchar(65) NOT NULL,
    \`description\` varchar(50) DEFAULT NULL,
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS \`User\` (
    \`id\` varchar(36) NOT NULL,
    \`mail\` varchar(60) DEFAULT NULL,
    \`name\` varchar(100) DEFAULT NULL,
    \`phone\` varchar(20) DEFAULT NULL,
    \`taxId\` varchar(255) DEFAULT NULL,
    \`birthDate\` datetime(6) DEFAULT NULL,
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`deletedAt\` timestamp NULL DEFAULT NULL,
    \`createdBy\` varchar(36) DEFAULT NULL,
    \`updatedBy\` varchar(36) DEFAULT NULL,
    \`deletedBy\` varchar(36) DEFAULT NULL,
    \`picture\` varchar(255) DEFAULT NULL,
    \`isActive\` tinyint(1) NOT NULL DEFAULT '1',
    \`organizationParentId\` varchar(36) DEFAULT NULL,
    \`invitedFromId\` varchar(36) DEFAULT NULL,
    \`isAdmin\` tinyint(1) NOT NULL DEFAULT '0',
    \`userName\` varchar(50) DEFAULT NULL,
    \`cognitoToken\` varchar(250) DEFAULT NULL,
    \`mainRoleId\` varchar(36) DEFAULT NULL,
    \`isVerified\` tinyint(1) NOT NULL DEFAULT '0',
    \`referalCode\` varchar(12) DEFAULT NULL,
    \`interviewId\` varchar(36) DEFAULT NULL,
    \`status\` varchar(36) NOT NULL DEFAULT 'CREATED',
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_phone\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS \`UserRole\` (
    \`id\` varchar(36) NOT NULL DEFAULT(uuid()),
    \`userId\` varchar(36) NOT NULL,
    \`roleId\` varchar(36) NOT NULL,
    \`roleStatus\` varchar(36) NOT NULL DEFAULT 'CREATED',
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`deletedAt\` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`fk_user_role_role_id\` (\`roleId\`),
    KEY \`fk_user_role_user_id\` (\`userId\`),
    CONSTRAINT \`fk_user_role_role_id\` FOREIGN KEY (\`roleId\`) REFERENCES \`Role\` (\`id\`),
    CONSTRAINT \`fk_user_role_user_id\` FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS \`UserPaymentsStatus\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userid\` varchar(36) NOT NULL,
    \`stripeId\` VARCHAR(255),
    \`paymentStatus\` VARCHAR(50),
    FOREIGN KEY (\`userid\`) REFERENCES \`User\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO \`Role\` (\`id\`, \`name\`, \`description\`)
VALUES
    ('ADMIN', 'ADMIN', 'A user that is an admin of bricksell.'),
    ('BROKER', 'BROKER', 'A user that is a worker from an Organization.'),
    ('BUYER', 'BUYER', 'A user that can buy a property.'),
    ('MASTERBROKER', 'MASTERBROKER', 'A user that is a master broker of an organization'),
    ('NOTARY', 'NOTARY', 'A user that is a notary of an organization.'),
    ('OWNER', 'OWNER', 'A user that is an owner of a property.'),
    ('PARTNER', 'PARTNER', 'A user that is a bricksell partner.');
"@

# Execute SQL commands
mysql -h $MYSQL_HOST -u $MYSQL_USER -p"$MYSQL_PASSWORD_TEXT" -e $SQL_COMMANDS

# Check execution result
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database and tables created successfully."
    $JSON_OUTPUT = @"
mysql: {
  name: 'mysqlDs',
  connector: 'mysql',
  host: '$MYSQL_HOST',
  user: '$MYSQL_USER',
  password: '$MYSQL_PASSWORD',
  database: '$MYSQL_DB'
}
"@
    Write-Host "`nCopy and paste this into local.ts:`n$JSON_OUTPUT"
} else {
    Write-Host "There was a problem creating the database and tables."
}
