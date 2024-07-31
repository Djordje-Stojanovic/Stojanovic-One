# src/stojanovic_one/main.py

import sys
from PySide6.QtWidgets import QApplication
from stojanovic_one.ui.registration_form import RegistrationForm
from stojanovic_one.database.setup import initialize_database, create_user_table

def main(test_mode=False):
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)

    # Initialize database
    conn = initialize_database('users.db')
    create_user_table(conn)
    conn.close()

    # Create and show the registration form
    form = RegistrationForm()
    form.show()

    if test_mode:
        # In test mode, we'll process events for a short time instead of entering the main event loop
        app.processEvents()
        return None
    else:
        return app.exec()