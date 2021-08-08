set server_name=<put your server_name here>
TITLE %server_name%
curl http://bottaer.herokuapp.com/updateServerStatus/%server_name%/online
:: Run your serverfile here (for Example: java -Xmx8G -Xms8G -jar server.jar nogui)
curl http://bottaer.herokuapp.com/updateServerStatus/%server_name%/offline
pause