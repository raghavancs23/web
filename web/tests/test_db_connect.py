import importlib
import os
import unittest
from unittest.mock import Mock, patch


class DatabaseBootstrapTests(unittest.TestCase):
    def test_initialize_database_executes_schema_file(self):
        app = importlib.import_module("app")
        conn = Mock()
        cursor = Mock()
        conn.cursor.return_value = cursor
        conn.is_connected.return_value = True

        with patch.object(app, "get_db_connection", return_value=conn):
            result = app.initialize_database()

        self.assertTrue(result)
        executed_sql = "\n".join(str(call.args[0]) for call in cursor.execute.call_args_list)
        self.assertIn("CREATE TABLE IF NOT EXISTS users", executed_sql)
        self.assertIn("CREATE TABLE IF NOT EXISTS admin", executed_sql)


if __name__ == "__main__":
    unittest.main()
