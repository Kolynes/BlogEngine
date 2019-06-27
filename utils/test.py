from telethon import TelegramClient
import asyncio

async def send():
    client = TelegramClient("sessions/kolynes", "715079", "b5bdb0d5b249cdfc84a1975821278966")
    await client.connect()
    print("hi")
    await client.send_code_request("+2348131651917")

async def printer():
    print("hello")

asyncio.wait([send(), printer()])