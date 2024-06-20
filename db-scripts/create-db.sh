#!/bin/bash

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed. Please install MySQL and try again."
    exit 1
fi

# Prompt for MySQL credentials and database name
read -p "Enter your MySQL username: " MYSQL_USER
read -sp "Enter your MySQL password: " MYSQL_PASSWORD
echo
read -p "Enter MySQL host (default: 127.0.0.1): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-127.0.0.1}
read -p "Enter the database name you want to create: " MYSQL_DB

# Create database and tables
SQL_COMMANDS=$(cat <<EOF
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
EOF
)

# Execute SQL commands
mysql -h $MYSQL_HOST -u $MYSQL_USER -p"$MYSQL_PASSWORD" -e "$SQL_COMMANDS"

# Check execution result
if [ $? -eq 0 ]; then
    echo "Database and tables created successfully."
    JSON_OUTPUT=$(cat <<EOF
mysql: {
  name: 'mysqlDs',
  connector: 'mysql',
  host: '$MYSQL_HOST',
  user: '$MYSQL_USER',
  password: '$MYSQL_PASSWORD',
  database: '$MYSQL_DB'
}
EOF
)
    echo -e "\nCopy and paste this into local.ts:"
    echo "$JSON_OUTPUT"
else
    echo "There was a problem creating the database and tables."
fi
