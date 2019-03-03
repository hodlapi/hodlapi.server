# Infrastructure

The application is based on microservices architecture, here is a diagram of architecture:

![Base app architecture](http://dl3.joxi.net/drive/2019/03/03/0027/0112/1814640/40/225e1f65e8.jpg)

Server side is devided into three services:
- **Core** - is an entrypoint to server application. It has an api for creating requests and getting data for client app.
- **Parser** - is a service wich is used for parsing rates from data providers such as Binance, 0x, etc.
- **FileWriter** - is a service for creating rates list to zip files for attaching to request.