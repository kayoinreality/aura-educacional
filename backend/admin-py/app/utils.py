import random
import string
import time


def generate_cuid_like() -> str:
    ts = hex(int(time.time() * 1000))[2:]
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
    return f"c{ts}{rand}"
