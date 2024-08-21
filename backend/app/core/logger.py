import logging
from logging.handlers import RotatingFileHandler

def setup_logger():
    logger = logging.getLogger("stojanovic_one")
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    file_handler = RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5)
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger


logger = setup_logger()