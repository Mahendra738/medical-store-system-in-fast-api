import gzip
import subprocess
from datetime import datetime
from pathlib import Path

from app.core.config import settings


# Project root:
# medical_store/
BASE_DIR = Path(__file__).resolve().parents[2]

# Backup directory:
# medical_store/backups/
BACKUP_DIR = BASE_DIR / "backups"

# PostgreSQL 18 pg_dump installed through Homebrew on your Mac.
# We'll make this configurable later for Windows deployment.
PG_DUMP_PATH = "/opt/homebrew/opt/libpq/bin/pg_dump"


# Make sure the backup directory exists.
BACKUP_DIR.mkdir(parents=True, exist_ok=True)


def create_database_backup() -> dict:
    """
    Create a compressed PostgreSQL database backup.

    PostgreSQL database
            ↓
        pg_dump
            ↓
          .sql
            ↓
        gzip compression
            ↓
        .sql.gz
    """

    database_url = settings.DATABASE_URL

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"novacare_backup_{timestamp}.sql.gz"
    backup_path = BACKUP_DIR / backup_filename

    command = [
        PG_DUMP_PATH,
        database_url,
        "--no-owner",
        "--no-privileges",
    ]

    try:
        with gzip.open(backup_path, "wb") as backup_file:
            result = subprocess.run(
                command,
                stdout=backup_file,
                stderr=subprocess.PIPE,
                check=False,
            )

        # pg_dump failed
        if result.returncode != 0:
            if backup_path.exists():
                backup_path.unlink()

            error_message = result.stderr.decode(
                "utf-8",
                errors="replace",
            )

            raise RuntimeError(
                f"Database backup failed: {error_message}"
            )

        # Successful backup
        return {
            "success": True,
            "filename": backup_filename,
            "path": str(backup_path),
            "created_at": datetime.now().isoformat(),
            "size_bytes": backup_path.stat().st_size,
        }

    except FileNotFoundError:
        raise RuntimeError(
            f"pg_dump was not found at: {PG_DUMP_PATH}"
        )